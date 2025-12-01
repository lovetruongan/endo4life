import { EnvConfig } from '@endo4life/feature-config';
import { BaseApi } from '@endo4life/data-access';
import axios from 'axios';

export interface BookDto {
    id: string;
    title: string;
    author?: string;
    description?: string;
    fileUrl?: string;
    coverUrl?: string;
}

export class BookApiImpl extends BaseApi {
    constructor() {
        super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
    }

    /**
     * Get all books from the backend
     */
    async getBooks(): Promise<BookDto[]> {
        try {
            const authorization = await this.getAuthorization();
            const response = await axios.get<BookDto[]>(
                `${this.getBasePath()}/api/v1/books`,
                {
                    headers: {
                        Authorization: authorization,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching books:', error);
            throw error;
        }
    }

    /**
     * Get a single book by ID
     */
    async getBookById(id: string): Promise<BookDto | null> {
        try {
            const authorization = await this.getAuthorization();
            const response = await axios.get<BookDto>(
                `${this.getBasePath()}/api/v1/books/${id}`,
                {
                    headers: {
                        Authorization: authorization,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error fetching book ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a new book
     */
    async createBook(
        title: string,
        author?: string,
        description?: string,
        file?: File,
        cover?: File
    ): Promise<BookDto> {
        try {
            const authorization = await this.getAuthorization();
            const formData = new FormData();
            formData.append('title', title);
            if (author) formData.append('author', author);
            if (description) formData.append('description', description);
            if (file) formData.append('file', file);
            if (cover) formData.append('cover', cover);

            const response = await axios.post<BookDto>(
                `${this.getBasePath()}/api/v1/books`,
                formData,
                {
                    headers: {
                        Authorization: authorization,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    }

    /**
     * Update a book
     */
    async updateBook(
        id: string,
        title: string,
        author?: string,
        description?: string,
        file?: File,
        cover?: File
    ): Promise<BookDto> {
        try {
            const authorization = await this.getAuthorization();
            const formData = new FormData();
            formData.append('title', title);
            if (author) formData.append('author', author);
            if (description) formData.append('description', description);
            if (file) formData.append('file', file);
            if (cover) formData.append('cover', cover);

            const response = await axios.put<BookDto>(
                `${this.getBasePath()}/api/v1/books/${id}`,
                formData,
                {
                    headers: {
                        Authorization: authorization,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error updating book ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a book
     */
    async deleteBook(id: string): Promise<void> {
        try {
            const authorization = await this.getAuthorization();
            await axios.delete(`${this.getBasePath()}/api/v1/books/${id}`, {
                headers: {
                    Authorization: authorization,
                },
            });
        } catch (error) {
            console.error(`Error deleting book ${id}:`, error);
            throw error;
        }
    }
}

// Create singleton instance
export const bookApi = new BookApiImpl();
