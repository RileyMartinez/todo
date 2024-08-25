/**
 * Generates a random number with the specified number of digits.
 *
 * @param digits - The number of digits for the generated random number.
 * @returns The generated random number.
 */
export const generateRandomNumber = (digits: number): number => {
    return Math.floor(Math.random() * Math.pow(10, digits));
};
