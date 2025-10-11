"use client";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export type ThemeSwitcherProps = {
	value?: "light" | "dark" | "system";
	onChange?: (theme: "light" | "dark" | "system") => void;
	defaultValue?: "light" | "dark" | "system";
	className?: string;
};

export const ThemeSwitcher = ({
	value,
	onChange,
	defaultValue = "light",
	className,
}: ThemeSwitcherProps) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Use next-themes if no external control
	const currentTheme =
		value || (theme as "light" | "dark" | "system") || defaultValue;

	// Prevent hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div
				className={cn(
					"h-7 w-7 rounded-full bg-background ring-1 ring-border",
					className,
				)}
			>
				<div className="flex h-full w-full items-center justify-center">
					<Sun className="h-4 w-4 text-muted-foreground" />
				</div>
			</div>
		);
	}

	// Simple toggle logic: determine if we're currently in dark mode (including system resolving to dark)
	const isDarkMode =
		currentTheme === "dark" ||
		(currentTheme === "system" && resolvedTheme === "dark");
	const Icon = isDarkMode ? Moon : Sun;

	const handleThemeChange = () => {
		// Toggle between light and dark only, no system mode in the cycle
		const nextTheme = isDarkMode ? "light" : "dark";
		if (onChange) {
			onChange(nextTheme);
		} else {
			setTheme(nextTheme);
		}
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					type="button"
					onClick={handleThemeChange}
					aria-label={`Switch to ${isDarkMode ? "light" : "dark"} theme`}
					className={cn(
						"relative h-8 w-8 rounded-full bg-background border border-input cursor-pointer",
						"hover:bg-secondary transition-colors duration-200",
						"focus:outline-none",
						className,
					)}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<motion.div
						key={isDarkMode ? "dark" : "light"}
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{
							type: "spring",
							duration: 0.6,
							bounce: 0.3,
						}}
						className="flex h-full w-full items-center justify-center"
					>
						<Icon className="h-4 w-4 text-foreground" />
					</motion.div>
				</motion.button>
			</TooltipTrigger>
			<TooltipContent side="left">
				Switch to {isDarkMode ? "light" : "dark"} mode
			</TooltipContent>
		</Tooltip>
	);
};
