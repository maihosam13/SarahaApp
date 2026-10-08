import { errorRes } from "../utils/error.handle.js";

export const validation = (Schema) => {
    return (req, res, next) => {

        const validationErrors = [];

        Object.keys(Schema).map(ele => {

            const validationRes = Schema[ele].safeParse(req[ele]);

            if (!validationRes.success) {
                validationErrors.push({
                    [ele]: validationRes.error.issues
                });
            }

        });

        if (validationErrors.length) {
            errorRes({
                msg: "validation error",
                statusCode: 400,
                options: validationErrors
            });
        }

        next();
    };
};