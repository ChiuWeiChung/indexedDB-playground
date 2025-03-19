// import IndexedDBWithLibrary from '@/components/indexed-db-with-library';
import IndexedDBWithVanilla from '@/components/indexed-db-wih-vanilla';
export default function Home() {
  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-100 gap-4 items-center p-4">
      <p className="text-center text-green-500 font-bold text-3xl md:text-4xl lg:text-5xl">This is a PWA DEMO with IndexedDB</p>
      <div className="w-full md:max-w-lg lg:max-w-xl flex flex-col gap-4">
        {/* <IndexedDBWithLibrary /> */}
        <IndexedDBWithVanilla />
      </div>
    </div>
  );
}
