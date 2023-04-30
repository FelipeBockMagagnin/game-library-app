import { createContext, useState } from "react";

const AuthContext = createContext({
    signed: true,
    token: '',
    user: {}
});


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    async function signIn(user) {
        setUser(user);
    }

    function signOut() {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={
            {
                signed: true,
                token: '',
                user: user,
                signIn,
                signOut
            }
        }>
            {children}
        </AuthContext.Provider>
    )

};


export default AuthContext;