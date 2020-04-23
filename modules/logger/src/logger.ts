import {Enums} from "@danielyandev/qr-utils";
const ConsoleColors = Enums.ConsoleColors

class Logger {

    static log(message: any, type: string = 'log'): void {
        switch (type) {
            case 'info':
                console.info(ConsoleColors.blue, message, ConsoleColors.reset)
                break;
            case 'error':
                console.error(ConsoleColors.red, message, ConsoleColors.reset)
                break;
            case 'warn':
                console.warn(ConsoleColors.yellow, message, ConsoleColors.reset)
                break;
            case 'success':
                console.log(ConsoleColors.green, message, ConsoleColors.reset)
                break;
            default:
                console.log(message)
        }
    }

    static info(message: any): void {
        Logger.log(message, 'info')
    }

    static error(message: any): void {
        Logger.log(message, 'error')
    }

    static warn(message: any): void {
        Logger.log(message, 'warn')
    }

    static success(message: any): void {
        Logger.log(message, 'success')
    }

    info(message: any): void {
        Logger.info(message)
    }

    error(message: any): void {
        Logger.error(message)
    }

    warn(message: any): void {
        Logger.warn(message)
    }

    success(message: any): void {
        Logger.success(message)
    }

}

export default Logger