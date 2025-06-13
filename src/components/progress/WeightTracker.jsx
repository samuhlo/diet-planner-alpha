// src/components/progress/WeightTracker.jsx
import { useStore } from "@nanostores/preact";
import {
  $userGoal,
  $weightLog,
  $userData,
  addWeightEntry,
} from "../../stores/userProfileStore.ts";
import { useState, useMemo } from "preact/hooks";
import ProgressChart from "./ProgressChart";

export default function WeightTracker() {
  const goal = useStore($userGoal);
  const userData = useStore($userData);
  const weightLogObject = useStore($weightLog);
  const weightLog = useMemo(
    () => Object.values(weightLogObject || {}),
    [weightLogObject]
  );

  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Ordenar registros por fecha
  const sortedWeightLog = useMemo(() => {
    return weightLog.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [weightLog]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (sortedWeightLog.length === 0) return null;

    // Agrupar pesos por fecha y tomar el último de cada día
    const weightByDate = {};
    sortedWeightLog.forEach((entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString("es-ES");
      weightByDate[dateKey] = entry.weight;
    });

    // Obtener fechas únicas ordenadas
    const uniqueDates = Object.keys(weightByDate).sort((a, b) => {
      return (
        new Date(a.split("/").reverse().join("-")) -
        new Date(b.split("/").reverse().join("-"))
      );
    });

    const weights = uniqueDates.map((date) => weightByDate[date]);
    const latestWeight = weights[weights.length - 1];
    const initialWeight = weights[0];
    const totalChange = latestWeight - initialWeight;
    const averageWeight =
      weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

    // Calcular cambio en los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEntries = uniqueDates.filter((date) => {
      const entryDate = new Date(date.split("/").reverse().join("-"));
      return entryDate >= sevenDaysAgo;
    });

    const weeklyChange =
      recentEntries.length >= 2
        ? weightByDate[recentEntries[recentEntries.length - 1]] -
          weightByDate[recentEntries[0]]
        : 0;

    return {
      latestWeight,
      initialWeight,
      totalChange,
      averageWeight: Math.round(averageWeight * 10) / 10,
      weeklyChange,
      totalEntries: weights.length,
    };
  }, [sortedWeightLog]);

  const handleAddWeight = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 30 && weightValue < 200) {
      // Usar la fecha seleccionada, no la fecha actual
      const selectedDate = new Date(newDate);
      selectedDate.setHours(12, 0, 0, 0); // Establecer a mediodía para evitar problemas de zona horaria

      addWeightEntry({
        weight: weightValue,
        date: selectedDate.toISOString(),
      });
      setNewWeight("");
      setNewDate(new Date().toISOString().split("T")[0]);

      // Mostrar notificación
      setNotificationMessage("¡Peso registrado correctamente!");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } else {
      setNotificationMessage("El peso debe estar entre 30 y 200 kg");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDeleteWeight = () => {
    $weightLog.set({});
    setShowDeleteConfirm(false);
    setNotificationMessage("Todos los registros han sido eliminados");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleDeleteLastEntry = () => {
    if (sortedWeightLog.length > 0) {
      const newWeightLog = { ...weightLogObject };
      const lastEntryId = Object.keys(newWeightLog).find(
        (key) =>
          newWeightLog[key].date ===
          sortedWeightLog[sortedWeightLog.length - 1].date
      );
      if (lastEntryId) {
        delete newWeightLog[lastEntryId];
        $weightLog.set(newWeightLog);
        setNotificationMessage("Último registro eliminado");
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    }
  };

  const handleUpdateCurrentWeight = () => {
    if (userData?.weight) {
      const currentDate = new Date();
      currentDate.setHours(12, 0, 0, 0); // Establecer a mediodía para evitar problemas de zona horaria

      addWeightEntry({
        weight: userData.weight,
        date: currentDate.toISOString(),
      });
      setNotificationMessage("Peso actual del perfil registrado");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  return (
    <div class="space-y-6">
      {/* Notificación */}
      {showNotification && (
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                {notificationMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      {stats && (
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-stone-800 mb-4">
            Resumen de Progreso
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">
                {stats.latestWeight} kg
              </div>
              <div class="text-sm text-gray-400">Peso actual</div>
            </div>
            {/*Peso objetivo*/}
            {goal && (
              <div class="text-center">
                <div class="text-2xl font-bold text-red-400">
                  {goal.targetWeight} kg
                </div>
                <div class="text-sm text-gray-600">Peso objetivo</div>
              </div>
            )}
            <div class="text-center">
              <div
                class={`text-2xl font-bold ${
                  stats.totalChange >= 0 ? "text-red-400" : "text-green-600"
                }`}
              >
                {stats.totalChange >= 0 ? "+" : ""}
                {stats.totalChange.toFixed(1)} kg
              </div>
              <div class="text-sm text-gray-600">Cambio total</div>
            </div>
            <div class="text-center">
              <div
                class={`text-2xl font-bold ${
                  stats.weeklyChange >= 0 ? "text-red-400" : "text-green-600"
                }`}
              >
                {stats.weeklyChange >= 0 ? "+" : ""}
                {stats.weeklyChange.toFixed(1)} kg
              </div>
              <div class="text-sm text-gray-600">Últimos 7 días</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-600">
                {stats.totalEntries}
              </div>
              <div class="text-sm text-gray-600">Registros</div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico */}
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-stone-800 mb-4">
          Tu Progreso Visual
        </h3>
        <div class="h-96">
          <ProgressChart weightLog={sortedWeightLog} goal={goal} />
        </div>
      </div>

      {/* Controles */}
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-stone-800 mb-4">
          Gestionar Registros
        </h3>

        {/* Formulario para añadir peso */}
        <form onSubmit={handleAddWeight} class="space-y-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Nuevo Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onInput={(e) => setNewWeight(e.target.value)}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: 75.5"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-[#6B8A7A] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition"
          >
            Añadir Registro
          </button>
        </form>

        {/* Botones de acción */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleUpdateCurrentWeight}
            disabled={!userData?.weight}
            class="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Usar Peso Actual
          </button>
          <button
            onClick={handleDeleteLastEntry}
            disabled={sortedWeightLog.length === 0}
            class="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Borrar Último
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={sortedWeightLog.length === 0}
            class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Borrar Todos
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showDeleteConfirm && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p class="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar todos los registros de peso?
              Esta acción no se puede deshacer.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteWeight}
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Eliminar Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
