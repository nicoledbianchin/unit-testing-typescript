import { Utils } from '../app/Utils';

describe('Utils test suit', () => {
    beforeEach(() => {
        console.log('before each');
    });

    beforeAll(() => {
        console.log('before all');
    });

    test('First test', () => {
        const result = Utils.toUpperCase('something');
        expect(result).toBe('SOMETHING')
    })

    test('Parse simple url', () => {
        const parsedUrl = Utils.parseUrl('http://localhost:4444/login');
        expect(parsedUrl.href).toBe('http://localhost:4444/login');
        expect(parsedUrl.port).toBe('4444');
        expect(parsedUrl.protocol).toBe('http:');
        expect(parsedUrl.query).toEqual({});
    });

    test('Parse url with query', () => {
        const parsedUrl = Utils.parseUrl('http://localhost:4444/login?user=user&password=1234');
        const query = {
            user: 'user',
            password: '1234'
        }
        expect(parsedUrl.query).toEqual(query);
    });

    test.todo('test invalid url');
});