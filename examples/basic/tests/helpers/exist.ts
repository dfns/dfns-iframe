export const checkElementExistsByTestId = async (page, testId) => {
  const element = await page.$(`[data-testid="${testId}"]`);
  return element !== null;
};
