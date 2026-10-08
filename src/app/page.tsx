import dynamic from 'next/dynamic';

const GameScreen = dynamic(() => import('@/components/GameScreen'), { ssr: false });

export default function Page() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center bg-gradient-to-b from-red-200 to-green-300">
      <div className="relative block">
        <GameScreen />
      </div>
    </div>
  );
}