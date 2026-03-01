import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class MicrosoftGraphService {
    private readonly logger = new Logger(MicrosoftGraphService.name);

    constructor(private readonly httpService: HttpService) {}

    /**
     * Fetches user profile picture from Microsoft Graph API
     * @param accessToken Microsoft OAuth access token
     * @returns URL to profile picture or null if not available
     */
    async getUserProfilePicture(accessToken: string): Promise<string | null> {
        try {
            // First check if the user has a profile photo
            const response = await firstValueFrom(
                this.httpService
                    .get('https://graph.microsoft.com/v1.0/me/photo', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    })
                    .pipe(
                        catchError((error: AxiosError) => {
                            this.logger.error(error, 'Failed to check if profile photo exists');
                            throw error;
                        }),
                    ),
            );

            if (response.status !== 200) {
                return null;
            }

            // Get the photo content
            const photoResponse = await firstValueFrom(
                this.httpService
                    .get('https://graph.microsoft.com/v1.0/me/photo/$value', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                        responseType: 'arraybuffer',
                    })
                    .pipe(
                        catchError((error: AxiosError) => {
                            this.logger.error(error, 'Failed to fetch profile photo content');
                            throw error;
                        }),
                    ),
            );

            // Convert to base64 data URL
            const base64 = Buffer.from(photoResponse.data).toString('base64');
            const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
            return `data:${contentType};base64,${base64}`;
        } catch (error) {
            this.logger.error(error, 'Failed to fetch Microsoft profile picture');
            return null;
        }
    }
}
