export const catchAsyncErrors = (passedFunction) => {
  return (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
  };
};
