import { Inject, Type } from '@nestjs/common';

export const getRepositoryToken = (entity: Type): string => `${entity.name}Repository`;

export const InjectRepository = (entity: Type): ParameterDecorator =>
  Inject(getRepositoryToken(entity));
