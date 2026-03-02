import { Verb } from '@/types';

export interface IVerbRepository {
    init(): Promise<void>;
    getAll(): Promise<Verb[]>;
    create(data: Verb): Promise<Verb>;
    update(data: Verb): Promise<Verb>;
    delete(id: string): Promise<void>;
}