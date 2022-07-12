import { Authorizer } from '../../app/Authorization/Authorizer';
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess';
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess';
import { Account, SessionToken, TokenState } from '../../app/Models/ServerModels';

jest.mock('../../app/Authorization/SessionTokenDBAccess');
jest.mock('../../app/Authorization/UserCredentialsDbAccess');

describe('Authorizer test suite', () => {
    let authorizer: Authorizer;

    const sessionTokenDBAccessMock = {
        storeSessionToken: jest.fn(),
        getToken: jest.fn()
    };
    const userCredentialsDBAccessMock = {
        getUserCredential: jest.fn()
    };
    const someAccount: Account = {
        username: 'user',
        password: 'password'
    }

    beforeEach(() => {
        authorizer = new Authorizer(
            sessionTokenDBAccessMock as any,
            userCredentialsDBAccessMock as any,
        );
    });

    test('constructor arguments', () => {
        new Authorizer;
        expect(SessionTokenDBAccess).toBeCalled();
        expect(UserCredentialsDbAccess).toBeCalled();
    });

    test('should return null if invalid credentials', async () => {
        userCredentialsDBAccessMock.getUserCredential.mockReturnValue(null);
        const loginResult = await authorizer.generateToken(someAccount);
        expect(loginResult).toBeNull;
        expect(userCredentialsDBAccessMock.getUserCredential).
            toBeCalledWith(someAccount.username, someAccount.password);
    });

    test('should return session token for valid credentions', async () => {
        jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
        jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);

        userCredentialsDBAccessMock.getUserCredential.mockResolvedValueOnce({
            username: 'user',
            accessRights: [1, 2, 3]
        });

        const expectedSessionToken: SessionToken = {
            userName: 'user',
            accessRights: [1, 2, 3],
            valid: true,
            tokenId: '',
            expirationTime: new Date(60 * 60 * 1000)
        };
        const sessionToken = await authorizer.generateToken(someAccount);
        expect(expectedSessionToken).toEqual(sessionToken);
        expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken);
    });

    test('validateToken returns invalid for null token', async () => {
        sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null);
        const sessionToken = await authorizer.validateToken('123');
        expect(sessionToken).toStrictEqual({
            accessRights: [],
            state: TokenState.INVALID
        });
    });

    test('validateToken returns expired for expired tokens', async () => {
        const dateInPast = new Date(Date.now() - 1);
        sessionTokenDBAccessMock.getToken.mockReturnValueOnce({ valid: true, expirationTime: dateInPast });
        const sessionToken = await authorizer.validateToken('123');
        expect(sessionToken).toStrictEqual({
            accessRights: [],
            state: TokenState.EXPIRED
        });
    });

    test('validateToken returns valid for not expired and valid tokens', async () => {
        const dateInFuture = new Date(Date.now() + 100000);
        sessionTokenDBAccessMock.getToken.mockReturnValue(
            {
                valid: true,
                expirationTime: dateInFuture,
                accessRights: [1]
            });
        const sessionToken = await authorizer.validateToken('123');
        expect(sessionToken).toStrictEqual({
            accessRights: [1],
            state: TokenState.VALID
        });
    });

});