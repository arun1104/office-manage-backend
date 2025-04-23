import axios from "axios";

export class WhatsappService {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor({ baseURL, apiKey }: { baseURL: string; apiKey: string }) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.sendMessage = this.sendMessage.bind(this);
    this.prepareBody = this.prepareBody.bind(this);
  }

  async sendMessage({
    campaignName,
    to,
    parameters,
  }: {
    to: string;
    parameters: string[];
    campaignName: string;
  }) {
    const body = this.prepareBody({
      apiKey: this.apiKey,
      campaignName,
      parameters,
      to,
    });
    const response = await axios.post(this.baseURL, body);
    return response.data;
  }

  private prepareBody({
    apiKey,
    campaignName,
    parameters,
    to,
  }: {
    to: string;
    parameters: string[];
    campaignName: string;
    apiKey: string;
  }) {
    return {
      apiKey,
      campaignName,
      destination: "91" + to,
      userName: "Q-GET",
      templateParams: parameters,
      source: "new-landing-page form",
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {},
      paramsFallbackValue: {
        FirstName: "user",
      },
    };
  }
}
