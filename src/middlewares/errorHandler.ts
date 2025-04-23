import { RESPOSE_CODES, COMMON_ERROR_MESSAGES} from "@constants";
export const errorHandler = (...args: any[]) => {
    if (args.length === 4)
        args[2].status(RESPOSE_CODES.UNKNOWN_ERROR).send({ message: COMMON_ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    else
        args[1].status(RESPOSE_CODES.UNKNOWN_ERROR).send({ message: COMMON_ERROR_MESSAGES.ROUTE_NOT_REGISTERED });
};
