import { LoginHandler } from '../../app/Handlers/LoginHandler';
import { HTTP_CODES, HTTP_METHODS, SessionToken } from '../../app/Models/ServerModels';
import { Utils } from '../../app/Utils/Utils';


describe('LoginHandler test suite', () => {
    let loginHandler: LoginHandler;
    const requestMock = {
        method: ''
    };
    const responseMock = {
        writeHead: jest.fn(),
        write: jest.fn(),
        statusCode: 0
    };
    const authorizeMock = {
        generateToken: jest.fn()
    };
    const getRequestBodyMock = jest.fn();

    const someSessionToken: SessionToken = {
        tokenId: 'tokenId',
        userName: 'username',
        valid: true,
        expirationTime: new Date(),
        accessRights: [1, 2, 3]
    }

    beforeEach(() => {
        loginHandler = new LoginHandler(
            requestMock as any,
            responseMock as any,
            authorizeMock as any
        );
        Utils.getRequestBody = getRequestBodyMock;
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    test('options request', async () => {
        requestMock.method = HTTP_METHODS.OPTIONS;

        await loginHandler.handleRequest();

        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK);
        expect(responseMock.writeHead).toBeCalledTimes(1);
    });

    test('not handled http method', async () => {
        requestMock.method = 'invalidMethod';

        await loginHandler.handleRequest();

        expect(responseMock.writeHead).not.toBeCalled();
    });

    test('post request with valid login', async () => {
        requestMock.method = HTTP_METHODS.POST;
        getRequestBodyMock.mockReturnValueOnce({
            username: 'user',
            password: 'pass'
        });
        authorizeMock.generateToken.mockReturnValueOnce(someSessionToken);

        await loginHandler.handleRequest();

        expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, { 'Content-Type': 'application/json' });
        expect(responseMock.write).toBeCalledWith(JSON.stringify(someSessionToken));
    });
})