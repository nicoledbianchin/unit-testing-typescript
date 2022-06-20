import { LoginHandler } from '../../app/Handlers/LoginHandler';
import { HTTP_CODES, HTTP_METHODS } from '../../app/Models/ServerModels';

describe('LoginHandler test suite', () => {
    let loginHandler: LoginHandler;
    const requestMock = {
        method: ''
    };
    const responseMock = {
        writeHead: jest.fn()
    };
    const authorizeMock = {};

    beforeEach(() => {
        loginHandler = new LoginHandler(
            requestMock as any,
            responseMock as any,
            authorizeMock as any
        );
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
    })
})