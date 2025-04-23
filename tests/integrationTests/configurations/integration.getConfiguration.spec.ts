import { GetConfigurationHandler } from "../../../src/apis/configurations";
describe('Module - GetConfigurationHandler', () => {
    it('get configuration from redis', async () => { 
        const getConfigurationHandler = new GetConfigurationHandler();
            const mockReq = {
                query: {
                    configId: 'permissions'
                },
                authorizationInfo: {
                    orgId:process.env.orgId
                }
            };
            
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn()
            };
            await getConfigurationHandler.handler(mockReq, mockRes);
            const respSent = mockRes.send.mock.calls[0][0];
            expect(respSent['CONFIGURATION']['operationIdList']['getConfiguration']['name']).toBe('getConfiguration');
            expect(mockRes.status).toHaveBeenCalledWith(200);
    });
});