export const getLogger: (tag: string) => (...args: any) => void = 
    (tag: string) => (...args: any) => console.log(`[${tag}]`, ...args);