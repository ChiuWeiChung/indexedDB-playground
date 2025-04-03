import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col justify-center min-h-screen bg-gray-100 gap-4 items-center p-4">
      <p className="text-center font-bold text-3xl md:text-4xl lg:text-5xl">這是 Rick 在研究 IndexedDB 的小小專案</p>
      <Button asChild>
        <Link href="/example-transaction_request" className="bg-blue-500 text-white p-2 rounded-md">
          前往 Playground
        </Link>

      </Button>
    </div>
  );
}
