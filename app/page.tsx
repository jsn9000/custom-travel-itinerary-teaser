"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full flex flex-col items-center gap-8">
        {/* Logo - 40% Smaller */}
        <div className="transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer">
          <div
            className="w-[360px] h-[360px] md:w-[450px] md:h-[450px] lg:w-[510px] lg:h-[510px] rounded-full bg-white overflow-hidden relative"
            style={{
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.35), 0 15px 40px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Image
              src="/peekaboo-logo.png"
              alt="peekabooootravel Logo"
              fill
              className="object-cover scale-150"
              priority
            />
          </div>
        </div>

        {/* Video - 50% Smaller */}
        <div className="w-full max-w-56 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
          <video
            className="w-full h-auto"
            controls
            playsInline
          >
            <source src="/intro-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Statement Card - Hovering with Bold Text */}
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 md:p-12 transition-all duration-300 hover:shadow-3xl hover:-translate-y-2">
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-bold text-center mb-4" style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0.5px' }}>
            Are you a Travel Concierge? Have you ever shared your research, blood, sweat and tears with a client only to hear "Nevermind I change my mind" so they don't have to pay?
          </p>
          <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-bold text-center" style={{ fontFamily: '"Courier New", Courier, monospace', letterSpacing: '0.5px' }}>
            Try the import feature below to create a custom teaser webpage that will unlock after they pay the agreed upon fee. View the Demo for an example of the teaser webpage.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
          <button
            onClick={() => router.push('/demo')}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            View Demo
          </button>
          <button
            onClick={() => router.push('/import')}
            className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-full font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            style={{ fontFamily: '"Courier New", Courier, monospace' }}
          >
            Import Your Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
