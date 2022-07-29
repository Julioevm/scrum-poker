export function log(message: string | undefined) {
    const develop = process.env.NODE_ENV === "develop";
    develop && console.log(message);
}