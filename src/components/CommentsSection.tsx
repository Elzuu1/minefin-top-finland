import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/lib/auth";
import {
  deleteComment,
  fetchComments,
  postComment,
  toggleCommentLike,
  type CommentWithMeta,
} from "@/lib/comments";

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) return <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover" />;
  const letter = (name || "?").charAt(0).toUpperCase();
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[color:var(--neon)] to-[color:var(--neon-2)] font-mono text-sm font-black text-background">
      {letter}
    </div>
  );
}

function CommentItem({
  comment,
  serverId,
  onChange,
  depth = 0,
}: {
  comment: CommentWithMeta;
  serverId: string;
  onChange: () => void;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const name = comment.author?.display_name ?? comment.author?.username ?? "Pelaaja";

  const onLike = async () => {
    if (!user) {
      toast("Kirjaudu sisään tykätäksesi");
      return;
    }
    try {
      await toggleCommentLike(comment.id, user.id, comment.user_liked);
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Virhe");
    }
  };

  const onReply = async () => {
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await postComment(serverId, user.id, replyText, comment.id);
      setReplyText("");
      setReplying(false);
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Virhe");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Poistetaanko kommentti?")) return;
    try {
      await deleteComment(comment.id);
      onChange();
    } catch (e: any) {
      toast.error(e?.message ?? "Virhe");
    }
  };

  return (
    <div className={depth > 0 ? "mt-3 border-l border-border/60 pl-4" : ""}>
      <div className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
        <Avatar name={name} url={comment.author?.avatar_url} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold">{name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground/90">{comment.body}</p>
          <div className="mt-2 flex items-center gap-3 text-xs">
            <button
              onClick={onLike}
              className={[
                "inline-flex items-center gap-1 transition-colors",
                comment.user_liked ? "text-[color:var(--neon)]" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Heart className={["h-3.5 w-3.5", comment.user_liked ? "fill-current" : ""].join(" ")} />
              {comment.like_count}
            </button>
            {depth < 2 && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Vastaa
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                onClick={onDelete}
                className="ml-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-[color:var(--danger)]"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {replying && (
            <div className="mt-3 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Vastauksesi…"
                maxLength={1000}
                className="flex-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
              />
              <button
                onClick={onReply}
                disabled={submitting || !replyText.trim()}
                className="rounded-lg bg-[color:var(--neon)] px-3 py-2 text-xs font-bold text-background disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} serverId={serverId} onChange={onChange} depth={depth + 1} />
      ))}
    </div>
  );
}

export function CommentsSection({ serverId }: { serverId: string }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<CommentWithMeta[] | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const data = await fetchComments(serverId, user?.id);
    setComments(data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, user?.id]);

  const onSubmit = async () => {
    if (!user || !text.trim()) return;
    setSubmitting(true);
    try {
      await postComment(serverId, user.id, text);
      setText("");
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Virhe");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">Kommentit</h2>
        <span className="text-xs text-muted-foreground">{comments?.length ?? 0} kommenttia</span>
      </div>

      {user ? (
        <div className="mb-6 rounded-xl border border-border bg-card/60 p-4">
          <div className="flex gap-3">
            <Avatar
              name={profile?.display_name ?? profile?.username ?? "You"}
              url={profile?.avatar_url}
            />
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Kirjoita kommentti…"
                rows={2}
                maxLength={1000}
                className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{text.length}/1000</span>
                <button
                  onClick={onSubmit}
                  disabled={submitting || !text.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--neon)] px-4 py-1.5 text-xs font-bold text-background disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Lähetä
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-card/60 p-4 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-bold text-[color:var(--neon)] hover:underline">
            Kirjaudu sisään
          </Link>{" "}
          jättääksesi kommentin.
        </div>
      )}

      <div className="space-y-3">
        {!comments && <p className="text-sm text-muted-foreground">Ladataan…</p>}
        {comments?.length === 0 && (
          <p className="text-sm text-muted-foreground">Ei vielä kommentteja. Ole ensimmäinen!</p>
        )}
        {comments?.map((c) => (
          <CommentItem key={c.id} comment={c} serverId={serverId} onChange={load} />
        ))}
      </div>
    </section>
  );
}
