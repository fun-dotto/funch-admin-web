import Image from "next/image";
import { signInWithPopup } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";
import { auth, provider } from "../src/infrastructure/firebase";
import { useAuth } from "../src/contexts/AuthContext";
import { Button } from "./ui/button";
import { IoIosArrowBack } from "react-icons/io";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  const signInwithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
      alert("fun.ac.jpのアカウントでログインしてください");
    }
  };
  return (
    <header className="w-full flex items-center justify-between p-4 bg-[#F8F8F8] border-b-[2px] border-[#990000] font-extrabold">
      <div className="flex items-center ml-4 md:ml-8">
        <Image
          src="/favicon.ico"
          alt="Funch Logo"
          width={60}
          height={60}
          className="mr-2"
        />
        <span className="font-bold text-2xl md:text-[32px] text-[#990000] ml-2 md:ml-4">
          DottoFunch-メニューサイト
        </span>
      </div>
      <div className="mr-1 md:mr-2">
        {user ? (
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="h-8 bg-[#F8F8F8] border-none text-[#990000] hover:bg-[#B86666] hover:text-[#990000] text-base md:text-[20px] transition-colors"
              onClick={handleLogout}
            >
              <IoIosArrowBack />
              ログアウト
            </Button>
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full ml-2"
              />
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-8 bg-[#F8F8F8] border-none text-[#990000] hover:bg-[#B86666] hover:text-[#990000] font-medium text-base transition-colors"
            onClick={signInwithGoogle}
          >
            <FaGoogle className="mr-2" /> 未来大Googleアカウントでログイン
          </Button>
        )}
      </div>
    </header>
  );
}
