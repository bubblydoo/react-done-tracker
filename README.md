[Storybook](https://react-done-tracker.vercel.app)

# React Done Tracker

Keep track of when an async tree is done rendering.

```bash
npm i react-done-tracker
```

### Examples

```tsx
function Image({ src }: { src: string }) {
  const [loadedSrc, setLoadedSrc] = useState();

  useLeafDoneTracker({
    done: loadedSrc === src
  });

  return <img src={src} onLoad={(e) => setLoadedSrc(e.target.src)} />
}

export function App() {
  const doneTracker = useRootDoneTracker();

  useEffect(() => {
    const fn = () => console.log("✅");

    doneTracker.addEventListener("done", fn);
    return () => doneTracker.removeEventListener("done", fn);
  });

  return <DoneTrackerProvider value={doneTracker}>
    <Image src={"https://picsum.photos/200"}>
  </DoneTrackerProvider>
}
```

### How does this compare to Suspense?

Suspense is used for lazy loading data, and does not render anything to the DOM. React Done Tracker is made to wait for things to render to the DOM.

For example, you cannot use Suspense to wait for a large canvas to render, or for a video to be loaded into a &lt;video&gt; element.
