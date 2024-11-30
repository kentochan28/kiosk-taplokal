"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import removeTemporaryId from "../utils/removeCart";
import { auth } from "../utils/firebaseConfig";

const IdleTimer = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // Countdown for the modal
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setShowModal(false);
      setTimeLeft(10);

      if (pathName === "/home/" || pathName === "/login/") return;
      timeoutRef.current = setTimeout(() => {
        // Show modal after 20 seconds
        setShowModal(true);

        // Start countdown for the final 10 seconds before redirection
        countdownRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === 1) {
              // Once countdown hits 0, redirect to root route
              clearInterval(countdownRef.current as NodeJS.Timeout);
              resetTimer();
              const user = auth.currentUser;
              if (user != null) {
                removeTemporaryId(user.uid).then(() => {
                  router.push("/home/");
                });
              }
            }
            return prev - 1;
          });
        }, 1000);
      }, 120000);
    };

    // Listen for activity events
    const events = ["mousemove", "mousedown", "keypress", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router, pathName]);

  const cancelRedirect = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowModal(false);
    setTimeLeft(10);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-10 top-0 left-0 w-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-10 rounded-lg shadow-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-extrabold text-gray-800">
              Redirecting Soon...
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              No activity detected. You will be redirected to the home page in{" "}
              <span className="text-red-500 font-bold text-2xl">
                {timeLeft}
              </span>{" "}
              seconds.
            </p>

            <div className="mt-8">
              <button
                onClick={cancelRedirect} // Assuming you have a cancel function
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-lg text-xl"
              >
                Cancel Redirect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IdleTimer;
