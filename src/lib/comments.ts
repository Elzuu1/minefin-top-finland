import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "./auth";

export type CommentRow = {
  id: string;
  server_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
};

export type CommentWithMeta = CommentRow & {
  author: Profile | null;
  like_count: number;
  user_liked: boolean;
  replies: CommentWithMeta[];
};

export async function fetchComments(serverId: string, userId?: string | null): Promise<CommentWithMeta[]> {
  const { data: comments, error } = await supabase
    .from("server_comments")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const list = (comments ?? []) as CommentRow[];
  if (list.length === 0) return [];

  const userIds = Array.from(new Set(list.map((c) => c.user_id)));
  const commentIds = list.map((c) => c.id);

  const [{ data: profiles }, { data: likes }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", userIds),
    supabase.from("comment_likes").select("comment_id, user_id").in("comment_id", commentIds),
  ]);

  const profileMap = new Map<string, Profile>();
  for (const p of (profiles ?? []) as Profile[]) profileMap.set(p.id, p);

  const likeCount = new Map<string, number>();
  const userLiked = new Set<string>();
  for (const l of likes ?? []) {
    likeCount.set(l.comment_id, (likeCount.get(l.comment_id) ?? 0) + 1);
    if (userId && l.user_id === userId) userLiked.add(l.comment_id);
  }

  const enrich = (c: CommentRow): CommentWithMeta => ({
    ...c,
    author: profileMap.get(c.user_id) ?? null,
    like_count: likeCount.get(c.id) ?? 0,
    user_liked: userLiked.has(c.id),
    replies: [],
  });

  const map = new Map<string, CommentWithMeta>();
  const roots: CommentWithMeta[] = [];
  for (const c of list) map.set(c.id, enrich(c));
  for (const c of list) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function postComment(serverId: string, userId: string, body: string, parentId?: string | null) {
  const trimmed = body.trim();
  if (trimmed.length === 0 || trimmed.length > 1000) throw new Error("Invalid comment length");
  const { error } = await supabase.from("server_comments").insert({
    server_id: serverId,
    user_id: userId,
    body: trimmed,
    parent_id: parentId ?? null,
  });
  if (error) throw error;
}

export async function toggleCommentLike(commentId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("comment_likes")
      .insert({ comment_id: commentId, user_id: userId });
    if (error) throw error;
  }
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase.from("server_comments").delete().eq("id", commentId);
  if (error) throw error;
}
