export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">About</p>
      <h1 className="mt-3 font-display text-4xl font-medium text-text">
        We think tutorials broke software education.
      </h1>
      <div className="mt-8 space-y-5 text-text-muted">
        <p>
          Watching someone else write code is comfortable. It feels like progress. It
          isn&rsquo;t. The gap between understanding an explanation and independently
          producing the thing is exactly where most learners get stuck &mdash; and most
          platforms never make you cross it.
        </p>
        <p>
          FORGE is built around a different bet: that friction is the feature. Every
          concept ends in a test you have to pass, a system you have to fix, or a
          production incident you have to diagnose &mdash; not another video to watch.
        </p>
        <p>
          The AI mentor is built the same way. It answers questions with questions
          before it answers with answers, because the goal was never to help you
          finish faster. It was to help you actually become an engineer.
        </p>
      </div>
    </div>
  );
}
