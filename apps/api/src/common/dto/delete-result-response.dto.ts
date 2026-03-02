/**
 * Safe response DTO for delete operations.
 *
 * Replaces TypeORM's `DeleteResult` to avoid leaking internal
 * database details in the API response.
 */
export class DeleteResultResponseDto {
    /**
     * Number of rows affected by the delete operation
     * @example 1
     */
    affected: number;

    constructor(affected: number) {
        this.affected = affected;
    }
}
