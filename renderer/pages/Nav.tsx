"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import removeTemporaryId from "../utils/removeCart";
import Modal from "../components/Modal";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, fs } from "../utils/firebaseConfig";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import icon from "../public/images/icon.png";
import toast from "react-hot-toast";


const Nav = () => {
    const [time, setTime] = useState("");
    const pathName = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null)
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                localStorage.setItem("kiosk", currentUser.displayName);
            } else {
                localStorage.removeItem("cashier");
                setUser(null);
            }
            setIsLoading(false); // Stop loading once we know the user state
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && !isLoading) {
            const userDocRef = doc(fs, 'users', user.uid);
            const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    if (userData.role !== 'kiosk') {
                        auth.signOut().then(() => {
                            toast.error("You are not authorized to login as kiosk");
                            router.push("/login");
                        });
                    }
                } else {
                    auth.signOut().then(() => {
                        router.push("/login");
                    });
                }
            });

            return () => unsubscribe();
        } else if (!isLoading) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    useEffect(() => {
        let unsubscribe = () => { };

        if (user != null) {
            const cartsCollectionRef = collection(fs, 'carts');
            const q = query(cartsCollectionRef, where("customerId", "==", user.uid), where("status", "==", "cart"));

            unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    const cartDoc = querySnapshot.docs[0];
                    const items = cartDoc.data().items || [];

                    const totalQuantity: number = items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);
                    setCartItemCount(totalQuantity);
                } else {
                    setCartItemCount(0);
                }
            }, (error) => {
                console.error("Error fetching cart item count: ", error);
            });
        } else if (!isLoading) {
            // Only redirect to login if the user is null and loading is complete
            setCartItemCount(0);
            router.push("/login");
        }

        return () => unsubscribe();
    }, [user, isLoading, router]);

    useEffect(() => {
        setTime(new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase());

        const intervalId = setInterval(() => {
            setTime(new Date().toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);


    const handleBack = () => {
        if (pathName != "/home") {
            router.back();
        }
    }

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirm = () => {
        if (user != null) {
            removeTemporaryId(user.uid).then(() => {
                router.push("/home");
                setIsModalOpen(false);
            });
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <nav className="mx-auto container px-20">
            <ul className="flex w-full justify-between items-center py-4 px-2 text-3xl text-foreground ">
                <Link href={"?"} onClick={handleBack}>{pathName == "/home/" ? time : <div className="flex gap-2 items-center text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    <p>Back</p>
                </div>}</Link>
                <div className="cursor-pointer font-bold hover:drop-shadow-lg" onClick={() => setIsModalOpen(pathName != "/home/")}>
                    <Image src={icon} width={75} height={75} alt={"logo"} />
                </div>
                <Link href={"/cart"} className={`${pathName == "/cart" && "bg-foreground text-white"} relative hover:bg-foreground rounded-lg hover:text-white p-1`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                    </svg>
                    <p className="absolute top-0 right-0 bg-red-400 rounded-full text-background text-xs px-1">{cartItemCount}</p>
                </Link>
            </ul>
            <Modal isOpen={isModalOpen} onConfirm={handleConfirm} onCancel={handleCancel} />
        </nav>
    )
}

export default Nav