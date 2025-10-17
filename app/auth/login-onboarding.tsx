"use client";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const onboardingSteps = [
  {
    id: 1,
    title: "Your AI Playground",
    subtitle: "Chat with Multiple Powerful AI Models in One Place.",
    bgImage: "/onboarding-bg1.png",
    mainImage: "/onboarding-1.png",
  },
  {
    id: 2,
    title: "One Platform to Streamline all Model",
    subtitle: "Chat with Multiple Powerful AI Models in One Place.",
    bgImage: "/onboarding-bg1.png",
    mainImage: "/onboarding-2.png",
  },
  {
    id: 3,
    title: "Compare All Model Instantly",
    subtitle: "Chat with Multiple Powerful AI Models in One Place.",
    bgImage: "/onboarding-bg2.png",
    mainImage: "/onboarding-3.png",
  },
];

export default function LoginOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<Partial<LoginFormData>>({});
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % onboardingSteps.length);
    }, 10000); // Change every 10 seconds

    return () => clearInterval(timer);
  }, [mounted]);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleSignInWithGoogle() {
    const supabase = createClient();

    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await signInWithGoogle(supabase);

      // Redirect to the provider URL
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err);
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignIn() {
    try {
      // Validate form data
      const result = loginSchema.safeParse(formData);
      
      if (!result.success) {
        // Set validation errors
        const errors: Partial<LoginFormData> = {};
        if (result.error.issues) {
          result.error.issues.forEach((issue) => {
            const field = issue.path[0] as keyof LoginFormData;
            errors[field] = issue.message;
          });
        }
        setValidationErrors(errors);
        return;
      }

      // Clear any previous errors
      setValidationErrors({});
      setError(null);
      setIsLoading(true);

      // Make an API call to authenticate
      await new Promise(resolve => setTimeout(resolve, 1000));
            
    } catch (err: unknown) {
      console.error("Error signing in:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

    const logoVariants = {
    hidden: { opacity: 0, y: 6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6 },
  };

  const currentOnboarding = onboardingSteps[currentStep];

  return (
    <motion.div 
      className="flex h-screen w-full overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Left Side - Onboarding Carousel (Hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden md:block pt-1">
        {/* Background Image with Opacity */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <Image
              src={currentOnboarding.bgImage}
              alt="Background"
              fill
              className={`object-cover ${currentOnboarding.bgImage.includes('bg1') ? 'opacity-50' : 'opacity-80'}`}
              priority
            />
          </motion.div>
        </AnimatePresence>

   {/* Content */}
    <div className="relative z-10 flex h-full flex-col text-center text-white">
    {/* Top Content Section - Further reduced spacing */}
    <div className="flex flex-col items-center justify-center p-6 pt-8">
        {/* Logo */}
        <div className="mb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="yodoo-logo"
              className="mb-8 flex justify-center logo-float"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={logoVariants}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <Image
                src="/yodoo-logo-dark.png"
                alt="Yodoo Logo"
                width={120}
                height={40}
                className="h-auto w-auto"
                priority
              />
            </motion.div>
        </AnimatePresence>     
        </div>


        <div className="flex flex-col items-center pt-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={`content-${currentStep}`}
            className="mb-4 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          >
            <h2 className="mb-3 font-bold text-2xl text-white leading-tight">
                {currentOnboarding.title}
            </h2>
            <p className="text-gray-200 text-base leading-relaxed">
                {currentOnboarding.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Step Indicators */}
        <div className="mb-4 flex space-x-2">
            {onboardingSteps.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? "w-4 bg-white" : "w-2 bg-white/30"
                }`}
                />
            ))}
        </div>
        </div>

        {/* Main Content */}
    </div>

    {(currentStep === 0 || currentStep === 1) ? (
        <AnimatePresence mode="wait">
          <motion.div 
            key={`image-${currentStep}`}
            className="relative flex-1 w-full min-h-[400px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <Image
              src={currentOnboarding.mainImage}
              alt={currentOnboarding.title}
              fill
              className="object-cover object-top transition-all duration-500"
              priority
            />
          </motion.div>
        </AnimatePresence>
    ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={`image-${currentStep}`}
            className="flex justify-center pb-32 flex-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <div className="relative h-full w-full max-w-md">
              <Image
                src={currentOnboarding.mainImage}
                alt={currentOnboarding.title}
                fill
                className="object-contain transition-all duration-500"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>
    )}
    </div>
      </div>

      {/* Right Side - Login Form (Full width on mobile) */}
      <div className="relative flex w-full flex-col bg-black text-white md:w-1/2">
        {/* Radial glow effect in center */}
        <div className="absolute left-1/2 top-1/4 h-full w-full -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/light-glow.png"
            alt="Light Glow"
            fill
            className="object-contain opacity-80 scale-300"
            priority
          />
        </div>
        
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">

            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="mb-4 font-semibold text-xl sm:text-2xl text-white">
                Welcome back to Yodoo!
              </h2>
              <p className="text-gray-400 text-sm">
                Please enter your details to sign in your account.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="mb-2 block font-medium text-sm text-white">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-1 ${
                    validationErrors.email 
                      ? "border-red-500 bg-red-900/20 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-700 bg-gray-900/50 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="mb-2 block font-medium text-sm text-white">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 backdrop-blur-sm transition-all focus:outline-none focus:ring-1 ${
                    validationErrors.password 
                      ? "border-red-500 bg-red-900/20 focus:border-red-500 focus:ring-red-500" 
                      : "border-gray-700 bg-gray-900/50 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
                )}
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <Link href="#" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </motion.div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black px-2 text-gray-400">or login with</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 bg-gray-900/30 py-3 text-white backdrop-blur-sm transition-all"
                    onClick={handleSignInWithGoogle}
                    disabled={isLoading}
                  >
                    <Image
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    {isLoading ? "Connecting..." : "Sign in with Google"}
                  </Button>
                </motion.div>
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="#" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 rounded-md bg-red-900/20 p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-6 text-center flex items-baseline justify-between">
          <p className="text-gray-500 text-sm">
            © 2025 Yodoo
          </p>
          <div className="mt-2 flex justify-center space-x-6 text-sm">
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}