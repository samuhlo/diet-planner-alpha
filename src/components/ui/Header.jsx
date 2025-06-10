// src/components/Header.jsx
import { useStore } from "@nanostores/preact";
import { $isProfileComplete } from "../../stores/userProfileStore";

export default function Header() {
  // Nos suscribimos a la store computada para saber si mostrar la alerta.
  const isProfileComplete = useStore($isProfileComplete);

  return (
    <header>
      <div class="text-center mb-4">
        <h1 class="text-4xl md:text-5xl font-bold text-[#3a5a40]">
          Tu Camino Hacia el Bienestar
        </h1>
        <p class="mt-2 text-lg text-stone-600">
          Un plan interactivo para alcanzar tus objetivos
        </p>
      </div>

      {/* Alerta Condicional */}
      {!isProfileComplete && (
        <div
          class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-8"
          role="alert"
        >
          <p class="font-bold">¡Atención!</p>
          <p>
            Para obtener un análisis preciso y usar todas las funciones, por
            favor, completa tus datos en las pestañas "Mis Datos" y "Objetivo y
            Progreso".
          </p>
        </div>
      )}
    </header>
  );
}
