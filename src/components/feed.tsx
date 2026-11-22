"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, deletePost, searchPosts, type Post } from "@/lib/api";
import { EmptyState } from "./empty-state";
import { usernameFromToken } from "@/lib/session";

export function Feed({ token, onExpired, revision }: {
  token: string;
  revision: number;
  onExpired: () => void;
}) {
  const [filters, setFilters] = useState<{ keywords?: string; user?: string }>(
    {},
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const username = usernameFromToken(token);

  async function remove(post: Post) {
    if (deletingId || post.user !== username || !window.confirm("Delete this post?")) return;
    setDeleteError("");
    setDeletingId(post.id);
    try {
      await deletePost(token, post.id);
      setPosts((current) => current.filter(({ id }) => id !== post.id));
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) onExpired();
      else setDeleteError("The service could not delete this post.");
    } finally {
      setDeletingId("");
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    searchPosts(token, filters, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setPosts(result);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.status === 401) onExpired();
        else setError("Could not load posts. Search again to retry.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [filters, token, onExpired, revision]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("query")).trim();
    setLoading(true);
    setError("");
    setFilters(
      data.get("scope") === "user" ? { user: query } : { keywords: query },
    );
  }

  return (
    <section className="space-y-4" aria-label="Community posts">
      <form onSubmit={submit}>
        <label>
          Search posts <input name="query" type="search" />
        </label>
        <label>
          Search by
          <select name="scope">
            <option value="keywords">Caption</option>
            <option value="user">Exact creator</option>
          </select>
        </label>
        <button>Search</button>
      </form>
      {loading && <p role="status">Loading posts...</p>}
      {error && <p role="alert">{error}</p>}
      {deleteError && <p role="alert">{deleteError}</p>}
      {!loading && !error && posts.length === 0 && (
        <EmptyState title="No posts found">
          Try another caption or creator.
        </EmptyState>
      )}
      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-xl border border-[#d2dbd2] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-square bg-[#eef1ea]">
                {post.type === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.url}
                    alt={post.message || "Community image"}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
                {post.type === "video" && (
                  <video
                    src={post.url}
                    controls
                    preload="metadata"
                    className="h-full w-full bg-black object-contain"
                  />
                )}
                {post.type === "unknown" && (
                  <p className="grid h-full place-items-center text-sm text-slate-500">
                    Media unavailable
                  </p>
                )}
              </div>
              <div className="space-y-3 p-4">
                <h3 className="font-semibold leading-snug">{post.message}</h3>
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-7 place-items-center rounded-full bg-[#244935] text-xs font-semibold uppercase text-white"
                    >
                      {post.user.slice(0, 1)}
                    </span>
                    By {post.user}
                  </p>
                  {post.user === username && (
                    <button
                      disabled={!!deletingId}
                      onClick={() => void remove(post)}
                      className="border border-[#a12821] !bg-white text-sm !text-[#a12821] hover:!bg-[#fbeceb]"
                    >
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
