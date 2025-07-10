// src/components/Header.tsx
import type { VNode } from "preact";
import UserMenu from "./UserMenu";

export default function Header(): VNode {
  return (
    <header>
      {/* Barra de usuario */}
      <div className="flex justify-between items-center mb-4 p-4 bg-stone-50 rounded-lg">
        <div className="text-center flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3a5a40]">
            Tu Camino Hacia el Bienestar
          </h1>
          <p className="mt-2 text-lg text-stone-600">
            Un plan interactivo para alcanzar tus objetivos
          </p>
        </div>

        {/* Menú de usuario */}
        <UserMenu />
      </div>
    </header>
  );
}
