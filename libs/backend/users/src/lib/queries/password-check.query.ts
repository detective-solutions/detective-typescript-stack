export const passwordCheckQueryName = 'passwordCheck';
export const passwordCheckResponseProperty = 'isValid';

export interface IPasswordCheck {
  [passwordCheckQueryName]: { isValid: boolean }[];
}

// Make sure the query matches the API response interface above
export const passwordCheckQuery = `
  query ${passwordCheckQueryName}($email: string, $password: string) {
    ${passwordCheckQueryName}(func: eq(User.email, $email)) @normalize {
      ${passwordCheckResponseProperty}: checkpwd(User.password, $password)
    }
  }
`;
