import { EnvConfig } from '@endo4life/feature-config';
import { BaseApi } from '@endo4life/data-access';
import axios from 'axios';
import { IBookEntity } from '../types';

export interface BookListResponse {
  data: IBookEntity[];
  pagination: {
    page: number;
    size: number;
    totalCount: number;
  };
}

export class BookApiImpl extends BaseApi {
  constructor() {
    super(EnvConfig.Endo4LifeServiceUrl || 'http://localhost:8080');
  }

  async getBooks(): Promise<BookListResponse> {
    const authorization = await this.getAuthorization();
    const response = await axios.get<IBookEntity[]>(
      `${this.getBasePath()}/api/v1/books`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );
    return {
      data: response.data,
      pagination: {
        page: 0,
        size: response.data.length,
        totalCount: response.data.length,
      },
    };
  }

  async getBookById(id: string): Promise<IBookEntity | null> {
    const authorization = await this.getAuthorization();
    const response = await axios.get<IBookEntity>(
      `${this.getBasePath()}/api/v1/books/${id}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );
    return response.data;
  }

  async createBook(
    title: string,
    author?: string,
    description?: string,
    file?: File,
    cover?: File,
  ): Promise<IBookEntity> {
    const authorization = await this.getAuthorization();
    const formData = new FormData();
    formData.append('title', title);
    if (author) formData.append('author', author);
    if (description) formData.append('description', description);
    if (file) formData.append('file', file);
    if (cover) formData.append('cover', cover);

    const response = await axios.post<IBookEntity>(
      `${this.getBasePath()}/api/v1/books`,
      formData,
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  async updateBook(
    id: string,
    title: string,
    author?: string,
    description?: string,
    file?: File,
    cover?: File,
  ): Promise<IBookEntity> {
    const authorization = await this.getAuthorization();
    const formData = new FormData();
    formData.append('title', title);
    if (author) formData.append('author', author);
    if (description) formData.append('description', description);
    if (file) formData.append('file', file);
    if (cover) formData.append('cover', cover);

    const response = await axios.put<IBookEntity>(
      `${this.getBasePath()}/api/v1/books/${id}`,
      formData,
      {
        headers: {
          Authorization: authorization,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  }

  async deleteBook(id: string): Promise<void> {
    const authorization = await this.getAuthorization();
    await axios.delete(`${this.getBasePath()}/api/v1/books/${id}`, {
      headers: {
        Authorization: authorization,
      },
    });
  }
}

export const bookApi = new BookApiImpl();

