import { RESPOSE_CODES, BAD_REQUEST } from '@constants';
export const validate = validations => {
  return async (req, res, next) => {
    try {
      if (validations.length) {
        if (req.method.toLowerCase() === 'get') {
          validations[0].parse(req.query);
        } else if(req.accessInfo.isNewEntity || req.accessInfo.isUpdateEntity || req.accessInfo.isDeleteEntity || req.accessInfo.isWorkflow){
          validations[0][req.accessInfo.operationId].parse(req.body);
        }else {
          validations[0].parse(req.body);
        }
      }
      return next();
    } catch (error) {
      res.status(RESPOSE_CODES.BAD_INPUT).send({ message: BAD_REQUEST.invalidReqPayload.message, details: error.errors });
    }
  };
};
