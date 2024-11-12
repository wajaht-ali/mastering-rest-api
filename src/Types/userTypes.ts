// user types
export enum Role {
    User = "user",
    Admin = "admin",
};
export enum Gender {
    Male = "male",
    Female = "female",
    Other = "other",
};

export interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    role: Role,
    phone_no: number,
    gender: Gender,
    address: Address
    photo: string,
};


// address types
export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }