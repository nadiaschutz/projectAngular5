import { UseraccountModule } from './useraccount.module';

describe('UseraccountModule', () => {
  let useraccountModule: UseraccountModule;

  beforeEach(() => {
    useraccountModule = new UseraccountModule();
  });

  it('should create an instance', () => {
    expect(useraccountModule).toBeTruthy();
  });
});
