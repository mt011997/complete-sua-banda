import React, {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/ApiRequest";
import { toast } from "react-toastify";
import { iLogin, Login } from "../services/Login";
import { iRegisterMusician } from "../services/RegisterMusician";
import { iRegisterBand } from "../services/RegisterBand";

interface iGlobalContext {
  user: iUser | null;
  setUser: React.Dispatch<React.SetStateAction<iUser | null>>;
  loading: boolean;
  clearStorage: () => void;
  submitLogin({ email, password }: iLogin): void;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  openModalRemove: boolean;
  setOpenModalRemove: React.Dispatch<React.SetStateAction<boolean>>;
  filteredMusicians: iRegisterMusician[] | undefined;
  setFilteredMusicians: React.Dispatch<
    React.SetStateAction<iRegisterMusician[] | undefined>
  >;
  filteredBands: iRegisterBand[] | undefined;
  setFilteredBands: React.Dispatch<
    React.SetStateAction<iRegisterBand[] | undefined>
  >;
}

interface iGlobalContextProps {
  children: ReactNode;
}

interface iBandsInvites {
  bio: string;
  state: string;
  social_media: string;
  genre: string;
  image: string;
  name: string;
  userId: number;
  id: number;
}

interface iMemberInvites {
  id: number;
  userId: number;
  email: string;
  bio: string;
  estate: string;
  social_media: string;
  image: string;
  name: string;
  username: string;
  skill: string;
  skill_level: string;
}

export interface iUser {
  id: any;
  email: string;
  password: string;
  bio: string;
  state: string;
  social_media: string;
  image: string;
  type: "musico" | "banda";
  name: string;
  username?: string;
  skill?: string;
  skill_level?: string;
  genre?: string;
  requirement?: string[];
  bands_invites?: iBandsInvites[];
  member_invites?: iMemberInvites[];
}

export const GlobalContext = createContext<iGlobalContext>(
  {} as iGlobalContext
);

export const GlobalProvider = ({ children }: iGlobalContextProps) => {
  const [user, setUser] = useState<iUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalRemove, setOpenModalRemove] = useState(false);
  const [filteredMusicians, setFilteredMusicians] = useState<
    iRegisterMusician[] | undefined
  >([]);
  const [filteredBands, setFilteredBands] = useState<
    iRegisterBand[] | undefined
  >([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const id = localStorage.getItem("@id_CSB");
      const token = localStorage.getItem("@token_CSB");
      if (id && token) {
        try {
          setLoading(true);
          api.defaults.headers.common.authorization = `Bearer ${token}`;
          const { data } = await api.get<iUser>(`/users/${id}`);
          setUser(data);
          if (data.type === "musico") {
            navigate("/dashboardMusician", { replace: true });
          } else {
            navigate("/dashboardBand", { replace: true });
          }
        } catch (error) {
          console.error(error);
          clearStorage();
        } finally {
          setLoading(false);
        }
      }
    }
    loadUser();
  }, []);

  const clearStorage = () => {
    localStorage.removeItem("@id_CSB");
    localStorage.removeItem("@token_CSB");
    setUser(null);
  };

  const submitLogin = async ({ email, password }: iLogin) => {
    const userLogin = { email, password };

    try {
      const data = await Login(userLogin);

      setUser(data.user);

      api.defaults.headers.common.authorization = `Bearer ${data.accessToken}`;

      localStorage.setItem("@token_CSB", data.accessToken);
      localStorage.setItem("@id_CSB", data.user.id);

      if (data.user.type === "musico") {
        navigate("/dashboardMusician", { replace: true });
      } else {
        navigate("/dashboardBand", { replace: true });
      }
    } catch (error) {
      toast.error("Usuário inválido! Faça seu cadastro.");
      console.error(error);
    }
  };

  return (
    <GlobalContext.Provider
      value={{
        user,
        setUser,
        loading,
        clearStorage,
        submitLogin,
        openModal,
        setOpenModal,
        openModalRemove,
        setOpenModalRemove,
        filteredMusicians,
        setFilteredMusicians,
        filteredBands,
        setFilteredBands,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): iGlobalContext => {
  const context = useContext(GlobalContext);

  return context;
};
