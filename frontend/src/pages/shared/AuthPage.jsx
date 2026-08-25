import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { Eye, EyeOff } from 'lucide-react';
import { useSignIn, useSignUp, useAuth } from '@clerk/clerk-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  // Clerk Hooks
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { signOut } = useAuth();

  // Form States
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [signUpStep, setSignUpStep] = useState(1);
  const [signUpCode, setSignUpCode] = useState('');

  // Password Visibility States
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showFpPassword, setShowFpPassword] = useState(false);

  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fpStep, setFpStep] = useState(1);
  const [fpCode, setFpCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');

  useEffect(() => {
    if (location.pathname === '/signup') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location.pathname]);

  const handleToggle = (active, path) => {
    setIsActive(active);
    setError('');
    setSuccessMsg('');
    window.history.pushState(null, '', path);
  };

  const handleGoogleAuth = async (e) => {
    if (e) e.preventDefault();
    const currentOrigin = window.location.origin;
    try {
      if (isActive) {
        if (!isSignUpLoaded) {
          setError("Clerk is not loaded yet.");
          return;
        }
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: `${currentOrigin}/sso-callback`,
          redirectUrlComplete: `${currentOrigin}/auth-sync`,
        });
      } else {
        if (!isSignInLoaded) {
          setError("Clerk is not loaded yet.");
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
        setError("Google Login failed. Please check console for details.");
      }
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!isSignInLoaded) {
      setError("Authentication system is still initializing. Please wait...");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: signInEmail,
        password: signInPassword,
      });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else {
        console.log("Incomplete SignIn:", result);
        setIsLoading(false);
        setError(`Sign in requires further action: ${result.status}`);
      }
    } catch (err) {
      console.error("SignIn Error:", err);
      let errMsg = "An error occurred during sign in";
      if (err.errors && err.errors.length > 0) errMsg = err.errors[0].longMessage;
      else if (err.message) errMsg = err.message;
      else if (typeof err === 'string') errMsg = err;
      setError(errMsg);
      setIsLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!signInEmail) {
      setError("Please enter your email first");
      return;
    }
    setError('');
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: signInEmail,
      });
      setFpStep(2);
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Failed to send reset code");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: fpCode,
        password: fpNewPassword,
      });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else {
        console.log(result);
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Failed to reset password");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isSignUpLoaded) {
      setError("Authentication system is still initializing. Please wait...");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const nameParts = signUpName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';
      
      const result = await signUp.create({
        emailAddress: signUpEmail,
        password: signUpPassword,
        firstName: firstName,
        lastName: lastName
      });
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        navigate('/auth-sync');
      } else {
        console.log("Incomplete SignUp:", result);
        setIsLoading(false);
        if(result.unverifiedEmailAddress) {
           await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
           setSuccessMsg("Account created successfully! Check your email for the verification code.");
           setSignUpStep(2);
        } else {
           setError(`Sign up requires further action: ${result.status}`);
        }
      }
    } catch (err) {
      console.error("SignUp Error:", err);
      let errMsg = "An error occurred during sign up";
      if (err.errors && err.errors.length > 0) errMsg = err.errors[0].longMessage;
      else if (err.message) errMsg = err.message;
      else if (typeof err === 'string') errMsg = err;
      setError(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#1b1b1b] font-sans pt-16">
      <div 
        className={`relative overflow-hidden w-[768px] max-w-[90%] min-h-[550px] bg-white rounded-[30px] shadow-[0_5px_25px_rgba(0,0,0,0.6)] ${isActive ? 'active' : ''}`} 
        id="container"
      >
        
        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full transition-all duration-[600ms] ease-in-out left-0 w-1/2 signup-container ${
          isActive 
            ? 'translate-x-full opacity-100 z-[5] animate-move' 
            : 'opacity-0 z-[1]'
        }`}>
          {signUpStep === 1 ? (
            <form className="flex flex-col items-center justify-center h-full px-10 bg-white" onSubmit={handleSignUp}>
              <h1 className="text-3xl font-black text-gray-800 tracking-wide">Create Account</h1>
              <div className="flex gap-4 my-6">
                <button type="button" onClick={handleGoogleAuth} className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-[20%] text-gray-700 hover:bg-gray-100 transition-colors"><FaGoogle /></button>
              </div>
              <span className="text-xs text-gray-500 font-medium">or register with email</span>
              
              {error && isActive && <div className="text-red-500 text-xs text-center mt-2 font-medium">{error}</div>}
              {successMsg && isActive && <div className="text-green-500 text-xs text-center mt-2 font-medium">{successMsg}</div>}

              <input type="text" placeholder="Name" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
              <input type="email" placeholder="Enter E-mail" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
              <div className="relative w-full my-2">
                <input type={showSignUpPassword ? "text" : "password"} placeholder="Enter Password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} className="w-full px-4 py-3 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
                <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" disabled={isLoading} className="px-12 py-3 mt-4 bg-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Wait...' : 'Sign Up'}
              </button>
            </form>
          ) : (
            <form className="flex flex-col items-center justify-center h-full px-10 bg-white" onSubmit={handleVerifySignUp}>
              <h1 className="text-3xl font-black text-gray-800 tracking-wide text-center">Verify Email</h1>
              <span className="text-xs text-gray-500 font-medium text-center my-4">
                Enter the 6-digit verification code sent to {signUpEmail}
              </span>
              
              {error && isActive && <div className="text-red-500 text-xs text-center mt-2 font-medium">{error}</div>}
              {successMsg && isActive && <div className="text-green-500 text-xs text-center mt-2 font-medium">{successMsg}</div>}

              <input type="text" placeholder="Enter 6-digit Code" value={signUpCode} onChange={(e) => setSignUpCode(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow text-center tracking-widest font-bold" maxLength={6} />
              
              <button type="submit" disabled={isLoading} className="px-12 py-3 mt-4 bg-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Wait...' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => { setSignUpStep(1); setSuccessMsg(''); setError(''); }} className="my-4 text-xs font-semibold text-gray-500 hover:text-[#e31837] transition-colors">Back to Details</button>
            </form>
          )}
        </div>

        {/* Sign In Form */}
        <div className={`absolute top-0 h-full transition-all duration-[600ms] ease-in-out left-0 w-1/2 signin-container ${
          isActive 
            ? 'translate-x-full z-[1]' 
            : 'z-[2]'
        }`}>
          {isForgotPassword ? (
            <form className="flex flex-col items-center justify-center h-full px-10 bg-white" onSubmit={fpStep === 1 ? handleSendResetCode : handleResetPassword}>
              <h1 className="text-3xl font-black text-gray-800 tracking-wide text-center">Reset Password</h1>
              <span className="text-xs text-gray-500 font-medium text-center my-4">
                {fpStep === 1 ? "Enter your email to receive a reset code" : "Enter the code sent to your email and your new password"}
              </span>
              
              {error && !isActive && <div className="text-red-500 text-xs text-center mt-2 font-medium">{error}</div>}

              {fpStep === 1 ? (
                <>
                  <input type="email" placeholder="Enter E-mail" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
                  <button type="submit" className="px-12 py-3 mt-4 bg-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all">Send Code</button>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Enter 6-digit Code" value={fpCode} onChange={(e) => setFpCode(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
                  <div className="relative w-full my-2">
                    <input type={showFpPassword ? "text" : "password"} placeholder="Enter New Password" value={fpNewPassword} onChange={(e) => setFpNewPassword(e.target.value)} className="w-full px-4 py-3 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
                    <button type="button" onClick={() => setShowFpPassword(!showFpPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showFpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button type="submit" className="px-12 py-3 mt-4 bg-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all">Reset Password</button>
                </>
              )}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setFpStep(1); setError(''); }} className="my-4 text-xs font-semibold text-gray-500 hover:text-[#e31837] transition-colors">Back to Sign In</a>
            </form>
          ) : (
            <form className="flex flex-col items-center justify-center h-full px-10 bg-white" onSubmit={handleSignIn}>
              <h1 className="text-3xl font-black text-gray-800 tracking-wide">Sign In</h1>
              <div className="flex gap-4 my-6">
                <button type="button" onClick={handleGoogleAuth} className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-[20%] text-gray-700 hover:bg-gray-100 transition-colors"><FaGoogle /></button>
              </div>
              <span className="text-xs text-gray-500 font-medium">or sign in with email & password</span>
              
              {error && !isActive && <div className="text-red-500 text-xs text-center mt-2 font-medium">{error}</div>}

              <input type="email" placeholder="Enter E-mail" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} className="w-full px-4 py-3 my-2 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
              <div className="relative w-full my-2">
                <input type={showSignInPassword ? "text" : "password"} placeholder="Enter Password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} className="w-full px-4 py-3 text-sm bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#e31837] transition-shadow" />
                <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setError(''); }} className="my-3 text-xs font-semibold text-gray-500 hover:text-[#e31837] transition-colors">Forget Password?</a>
              <button type="submit" disabled={isLoading} className="px-12 py-3 mt-2 bg-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/30 hover:bg-[#c8102e] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Wait...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        {/* Sliding Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-[600ms] ease-in-out z-[1000] rounded-l-[100px] ${
          isActive ? '-translate-x-full rounded-r-[100px] rounded-l-none' : ''
        }`}>
          {/* Sliding Crimson Overlay */}
          <div className={`bg-gradient-to-br from-[#e31837] via-[#d61330] to-[#b30f26] h-full text-white relative left-[-100%] w-[200%] translate-x-0 transition-all duration-[600ms] ease-in-out ${
            isActive ? 'translate-x-1/2' : ''
          }`}>
            
            {/* Left Panel (Visible when container is Active/SignUp mode) */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-[30px] text-center top-0 transition-all duration-[600ms] ease-in-out ${
              isActive ? 'translate-x-0' : '-translate-x-[200%]'
            }`}>
              <h1 className="text-4xl font-black mb-2">Welcome To <br/> RoseDash</h1>
              <p className="my-5 text-sm leading-6 tracking-wide font-medium opacity-90">Sign in with your email & password to access your dashboard</p>
              <button 
                onClick={() => handleToggle(false, '/login')} 
                className="px-12 py-3 border-2 border-white bg-transparent hover:bg-white hover:text-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel (Visible when container is Inactive/SignIn mode) */}
            <div className={`absolute w-1/2 h-full flex flex-col items-center justify-center px-[30px] text-center top-0 right-0 transition-all duration-[600ms] ease-in-out ${
              isActive ? 'translate-x-[200%]' : 'translate-x-0'
            }`}>
              <h1 className="text-4xl font-black mb-2">Hello, Friend!</h1>
              <p className="my-5 text-sm leading-6 tracking-wide font-medium opacity-90">Enter your personal details and start your premium shopping journey with us</p>
              <button 
                onClick={() => handleToggle(true, '/signup')} 
                className="px-12 py-3 border-2 border-white bg-transparent hover:bg-white hover:text-[#e31837] text-white text-sm font-bold tracking-wider uppercase rounded-xl transition-all"
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
