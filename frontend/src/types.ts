export type AuthContextType = {
    auth: {
        token: string;
        name: string;
        email: string;
        role: number;
    };
    setAuth: (auth: {
        token: string;
        name: string;
        email: string;
        role: number;
    }) => void;
};

export type RouteType = {
    path: string;
    element: () => JSX.Element;
    _protected: number; // {-1: public, 0: shouldBeLoggedOut, 1: shouldBeLoggedIn}
    allowedRoles?: number[];
};

export type errorType = {
    code: number;
    message: string;
    description: string;
};

export type statusType = {
    loading: boolean;
    error: null | number;
};
