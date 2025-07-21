import { createContext, useContext, useRef, type ReactNode } from "react";
import { Toast } from "primereact/toast";
import type { ToastMessage } from "primereact/toast";

interface ToastContextType {
	show: (message: ToastMessage) => void;
	success: (details: Partial<ToastMessage>) => void;
	error: (details: Partial<ToastMessage>) => void;
	info: (details: Partial<ToastMessage>) => void;
	warn: (details: Partial<ToastMessage>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
	const toast = useRef<Toast>(null);

	const show = (message: ToastMessage) => {
		toast.current?.show(message);
	};

	const success = (details: Partial<ToastMessage>) => {
		show({ severity: "success", summary: "Success!", ...details });
	};

	const error = (details: Partial<ToastMessage>) => {
		show({ severity: "error", summary: "Error!", ...details });
	};

	const info = (details: Partial<ToastMessage>) => {
		show({ severity: "info", summary: "Info", ...details });
	};

	const warn = (details: Partial<ToastMessage>) => {
		show({ severity: "warn", summary: "Warning!", ...details });
	};

	return (
		<ToastContext.Provider value={{ show, success, error, info, warn }}>
			{children}
			<Toast ref={toast} />
		</ToastContext.Provider>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}
