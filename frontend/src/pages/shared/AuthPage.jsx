import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Store,
  Bike,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Star,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/signup');

  // Clerk Hooks
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isAuthLoaded, userId, signOut } = useAuth();

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form States
  const [signUpRole, setSignUpRole] = useState(() => localStorage.getItem('auth_role') || 'user');
  const [signUpStep, setSignUpStep] = useState(0); // 0: Choose Role, 1: Form Details, 2: OTP Verification
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpCode, setSignUpCode] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [showFpPassword, setShowFpPassword] = useState(false);

  // MFA State
  const [isMfa, setIsMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  // Status & Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthLoaded && userId) {
      navigate('/');
    }
  }, [isAuthLoaded, userId, navigate]);

  useEffect(() => {
    const signupPath = location.pathname === '/signup';
    setIsSignUp(signupPath);
    setError('');
    setSuccessMsg('');
    if (signupPath) {
      setSignUpStep(0);
    } else {
      localStorage.removeItem('auth_role');
    }
  }, [location.pathname]);

  const switchMode = (signup) => {
    setIsSignUp(signup);
    setError('');
    setSuccessMsg('');
    setIsForgotPassword(false);
    setIsMfa(false);
    if (signup) {
      setSignUpStep(0);
      window.history.pushState(null, '', '/signup');
    } else {
      localStorage.removeItem('auth_role');
      window.history.pushState(null, '', '/login');
    }
  };

  const handleSelectRole = (role) => {
    setSignUpRole(role);
    localStorage.setItem('auth_role', role);
    setSignUpStep(1);
  };

  // Google OAuth Auth
  const handleGoogleAuth = async (e) => {
    if (e) e.preventDefault();
    const currentOrigin = window.location.origin;
    setError('');
    try {
      if (isSignUp) {
        if (!isSignUpLoaded) {
          setError("Auth system is still initializing. Please wait...");
          return;
        }
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: `${currentOrigin}/sso-callback`,
          redirectUrlComplete: `${currentOrigin}/auth-sync`,
        });
      } else {
        if (!isSignInLoaded) {
          setError("Auth system is still initializing. Please wait...");
          return;
        }
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: `${currentOrigin}/sso-callback`,
          redirectUrlComplete: `${currentOrigin}/auth-sync`,
        });
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      const errMsg = err.message || (err.errors && err.errors[0]?.longMessage) || '';
      if (errMsg.toLowerCase().includes("already signed in")) {
        await signOut();
        setError("Clearing previous incomplete session... Please click Google Login again.");
      } else {
        setError("Google Login failed. Please try again or use email.");
      }
    }
  };

  // Email/Password Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!isSignInLoaded) {
      setError("Authentication system is still initializing. Please wait...");
      return;
    }
    if (!signInEmail || !signInPassword) {
      setError("Please enter your email and password.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: signInEmail.trim(),
        password: signInPassword,
      });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else if (result.status === "needs_second_factor") {
        setIsLoading(false);
        setIsMfa(true);
        const hasEmailCode = result.supportedSecondFactors?.find(f => f.strategy === "email_code");
        if (hasEmailCode) {
          await signIn.prepareSecondFactor({ strategy: "email_code" });
          setSuccessMsg("Check your email for the 2FA login code.");
        } else {
          setSuccessMsg("Enter your Authenticator (TOTP) code or Backup code.");
        }
      } else {
        setIsLoading(false);
        setError(`Sign in requires further action: ${result.status}`);
      }
    } catch (err) {
      console.error("SignIn Error:", err);
      let errMsg = "Invalid email or password. Please try again.";
      if (err.errors && err.errors.length > 0) errMsg = err.errors[0].longMessage;
      else if (err.message) errMsg = err.message;
      setError(errMsg);
      setIsLoading(false);
    }
  };

  // MFA Verification
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode) return setError("Please enter the verification code");
    setError('');
    setIsLoading(true);
    try {
      const hasEmailCode = signIn.supportedSecondFactors?.find(f => f.strategy === "email_code");
      const result = await signIn.attemptSecondFactor({
        strategy: hasEmailCode ? "email_code" : "totp",
        code: mfaCode.trim()
      });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else {
        setError(`MFA failed: ${result.status}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Invalid MFA code. Please try again.");
      setIsLoading(false);
    }
  };

  // Send Reset Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!signInEmail) {
      setError("Please enter your registered email address first.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: signInEmail.trim(),
      });
      setFpStep(2);
      setSuccessMsg(`Password reset code has been sent to ${signInEmail}`);
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Failed to send reset code. Please check your email address.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!fpCode || !fpNewPassword) {
      setError("Please enter the reset code and your new password.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: fpCode.trim(),
        password: fpNewPassword,
      });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else {
        setError("Password reset incomplete. Please try again.");
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Failed to reset password. Code may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) {
      setError("Authentication system is still initializing. Please wait...");
      return;
    }
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setError("Please fill in all required details.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const nameParts = signUpName.trim().split(' ');
      const firstName = nameParts[0] || 'User';

      const signUpData = {
        emailAddress: signUpEmail.trim(),
        password: signUpPassword,
        firstName: firstName,
      };

      if (nameParts.length > 1) {
        signUpData.lastName = nameParts.slice(1).join(' ');
      }

      const result = await signUp.create(signUpData);
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate(`/verify-otp?email=${encodeURIComponent(signUpEmail)}&phone=${encodeURIComponent(signUpPhone)}&role=${encodeURIComponent(signUpRole)}`);
      } else {
        setIsLoading(false);
        if (result.status === 'missing_requirements' || result.unverifiedFields?.includes('email_address')) {
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setSuccessMsg(`Verification code sent to ${signUpEmail}`);
          setSignUpStep(2);
        } else {
          setError(`Sign up requires further action: ${result.status}`);
        }
      }
    } catch (err) {
      console.error("SignUp Error:", err);
      let errMsg = "An error occurred during registration.";
      if (err.errors && err.errors.length > 0) errMsg = err.errors[0].longMessage;
      else if (err.message) errMsg = err.message;
      setError(errMsg);
      setIsLoading(false);
    }
  };

  // Verify Sign Up Email OTP
  const handleVerifySignUp = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    if (!signUpCode) {
      setError("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: signUpCode.trim()
      });

      if (completeSignUp.status === 'complete') {
        await setSignUpActive({ session: completeSignUp.createdSessionId });
        navigate('/auth-sync');
      } else {
        setError("Verification incomplete. Please check the code and try again.");
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setError(err.errors?.[0]?.longMessage || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-rose-50/40 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_70px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: Auth Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Brand Logo & Tabs Header */}
            <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e31837] to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#e31837]/20 group-hover:scale-105 transition-transform">
                  <Zap size={20} className="fill-white" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                    Rose<span className="text-[#e31837]">Dash</span>
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">10-Min Delivery</span>
                </div>
              </Link>

              {/* Mode Toggle Switcher */}
              <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    !isSignUp && !isForgotPassword && !isMfa
                      ? 'bg-white text-slate-900 shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    isSignUp
                      ? 'bg-[#e31837] text-white shadow-sm font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="text-[#e31837] shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5"
              >
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* FLOW 1: MFA SECOND FACTOR */}
            {isMfa ? (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleMfaSubmit}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Two-Factor Authentication</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Enter the verification code sent to your authenticator or email.
                  </p>
                </div>

                <div className="relative">
                  <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-base font-black tracking-widest text-center outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#e31837] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#c8102e] transition shadow-lg shadow-[#e31837]/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsMfa(false); setError(''); }}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition py-1"
                >
                  ← Back to Login
                </button>
              </motion.form>

            /* FLOW 2: FORGOT PASSWORD */
            ) : isForgotPassword ? (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={fpStep === 1 ? handleSendResetCode : handleResetPassword}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Reset Password</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {fpStep === 1 ? "Enter your email to receive a password reset verification code." : "Enter the code received and choose your new secure password."}
                  </p>
                </div>

                {fpStep === 1 ? (
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Enter registered email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter 6-digit Code"
                        value={fpCode}
                        onChange={(e) => setFpCode(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-bold tracking-widest text-center outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                      />
                    </div>

                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showFpPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={fpNewPassword}
                        onChange={(e) => setFpNewPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFpPassword(!showFpPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showFpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#e31837] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#c8102e] transition shadow-lg shadow-[#e31837]/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : fpStep === 1 ? 'Send Reset Code' : 'Save New Password & Log In'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setFpStep(1); setError(''); }}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition py-1"
                >
                  ← Back to Sign In
                </button>
              </motion.form>

            /* FLOW 3: SIGN UP */
            ) : isSignUp ? (
              <AnimatePresence mode="wait">
                {signUpStep === 0 ? (
                  /* Step 0: Choose Role */
                  <motion.div
                    key="step-role"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Join RoseDash</h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">Select your account type to get started.</p>
                    </div>

                    <div className="grid gap-3 pt-2">
                      {/* Customer */}
                      <button
                        type="button"
                        onClick={() => handleSelectRole('user')}
                        className="p-4 rounded-2xl border-2 border-slate-200 hover:border-[#e31837] hover:bg-rose-50/40 transition-all text-left flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#e31837] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <ShoppingBag size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#e31837] transition-colors">Customer</h4>
                          <p className="text-xs text-slate-500">Order groceries, fresh food & essentials in 10 mins</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-[#e31837] group-hover:translate-x-1 transition-all" />
                      </button>

                      {/* Store Partner */}
                      <button
                        type="button"
                        onClick={() => handleSelectRole('partner')}
                        className="p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all text-left flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Store size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">Store Partner / Dark Store</h4>
                          <p className="text-xs text-slate-500">List products, manage inventory & receive fast orders</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </button>

                      {/* Delivery Rider */}
                      <button
                        type="button"
                        onClick={() => handleSelectRole('delivery')}
                        className="p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left flex items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Bike size={22} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">Delivery Fleet Partner</h4>
                          <p className="text-xs text-slate-500">Deliver 10-min orders and earn daily payouts + incentives</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                ) : signUpStep === 1 ? (
                  /* Step 1: Details Form */
                  <motion.form
                    key="step-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSignUp}
                    className="space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Registering as <span className="font-bold text-[#e31837] capitalize">{signUpRole === 'user' ? 'Customer' : signUpRole === 'partner' ? 'Store Partner' : 'Delivery Rider'}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSignUpStep(0)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-700"
                      >
                        Change Role
                      </button>
                    </div>

                    {/* Google OAuth Quick Button */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full py-3 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2.5 shadow-2xs"
                    >
                      <FaGoogle className="text-red-500 text-sm" />
                      <span>Sign up with Google</span>
                    </button>

                    <div className="flex items-center gap-3 my-2 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <div className="flex-1 h-px bg-slate-200" />
                      <span>Or fill credentials</span>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={signUpName}
                          onChange={(e) => setSignUpName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                        />
                      </div>

                      <div className="relative">
                        <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                        />
                      </div>

                      <div className="relative">
                        <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="Phone Number (+91...)"
                          value={signUpPhone}
                          onChange={(e) => setSignUpPhone(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                        />
                      </div>

                      <div className="relative">
                        <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={showSignUpPassword ? "text" : "password"}
                          required
                          placeholder="Create Password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showSignUpPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 mt-2 bg-[#e31837] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#c8102e] transition shadow-lg shadow-[#e31837]/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating Account...' : 'Continue & Verify'}
                    </button>
                  </motion.form>
                ) : (
                  /* Step 2: Email Code Verification */
                  <motion.form
                    key="step-otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleVerifySignUp}
                    className="space-y-4"
                  >
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Enter the 6-digit code sent to <strong className="text-slate-800">{signUpEmail}</strong>.
                      </p>
                    </div>

                    <div className="relative">
                      <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="6-Digit OTP"
                        value={signUpCode}
                        onChange={(e) => setSignUpCode(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-lg font-black tracking-widest text-center outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-[#e31837] text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-[#c8102e] transition shadow-lg shadow-[#e31837]/25 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Complete Sign Up'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setSignUpStep(1); setError(''); setSuccessMsg(''); }}
                      className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition py-1"
                    >
                      ← Back to Details
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

            /* FLOW 4: SIGN IN (DEFAULT) */
            ) : (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Sign in with your email to access orders, cart & instant delivery.
                  </p>
                </div>

                {/* Google OAuth Quick Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2.5 shadow-2xs"
                >
                  <FaGoogle className="text-red-500 text-base" />
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 my-3 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span>Or with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                    />
                  </div>

                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold outline-none focus:border-[#e31837] focus:ring-4 focus:ring-rose-500/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                    className="text-xs font-bold text-[#e31837] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Sign In */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Account'}
                  <ArrowRight size={16} />
                </button>
              </motion.form>
            )}
          </div>

          {/* Footer Terms */}
          <div className="pt-6 text-center text-[11px] text-slate-400 font-medium">
            By continuing, you agree to RoseDash's{' '}
            <Link to="/terms" className="text-slate-600 underline font-semibold">Terms</Link> &{' '}
            <Link to="/privacy" className="text-slate-600 underline font-semibold">Privacy Policy</Link>.
          </div>
        </div>

        {/* Right Side: Hero Visual Banner (Desktop only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#e31837] via-[#c8102e] to-[#990a20] p-10 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Ambient decorative glowing circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Top Tagline */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-black tracking-widest uppercase text-white backdrop-blur-xs border border-white/20">
              <Sparkles size={13} className="text-amber-300" /> Instant Quick-Commerce
            </span>
            <h3 className="text-3xl font-black mt-4 leading-tight">
              Fresh Groceries & Essentials in 10 Minutes.
            </h3>
            <p className="text-white/80 text-xs font-medium mt-2 leading-relaxed">
              Experience ultra-fast doorstep delivery powered by hyper-local dark stores and live rider tracking.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white text-[#e31837] flex items-center justify-center font-black shrink-0 shadow-sm">
                <Clock size={20} />
              </div>
              <div>
                <h5 className="font-black text-xs">10-Minute Lightning Delivery</h5>
                <p className="text-[11px] text-white/75">Packed and dispatched in under 120 seconds.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-black shrink-0 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h5 className="font-black text-xs">100% Quality & Fresh Guarantee</h5>
                <p className="text-[11px] text-white/75">Direct from top farms & verified local merchants.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center font-black shrink-0 shadow-sm">
                <Store size={20} />
              </div>
              <div>
                <h5 className="font-black text-xs">500+ Local Dark Store Hubs</h5>
                <p className="text-[11px] text-white/75">Serving across all major urban neighborhoods.</p>
              </div>
            </div>
          </div>

          {/* Social Proof Review Card */}
          <div className="relative z-10 bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="flex items-center gap-1 text-amber-300 mb-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-amber-300" />
              ))}
              <span className="text-[11px] font-black text-white ml-1.5">4.9 / 5</span>
            </div>
            <p className="text-xs text-white/90 italic font-medium">
              "Ordered cold beverages & ice cream in Delhi heat, arrived in 8 minutes flat! Outstanding service."
            </p>
            <div className="mt-2 text-[10px] font-bold text-white/70">
              — Pooja S., Verified Shopper
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthPage;
