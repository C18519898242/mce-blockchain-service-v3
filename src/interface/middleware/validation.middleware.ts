import { Request, Response, NextFunction } from 'express';
import { validateAddressGenerateRequest, validateAddressValidateRequest, AddressValidationDTO } from '../dto/address.dto';
import { validateBalanceRequest, BalanceValidationDTO } from '../dto/balance.dto';
import { logger } from '@infrastructure/logging/logger';

/**
 * 请求验证中间件
 * 用于验证不同API端点的请求参数
 */
export const validationMiddleware = (validationType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let validationResult: AddressValidationDTO | BalanceValidationDTO;
      let isValid = false;
      let errors: string[] = [];

      // 根据验证类型调用对应的验证函数
      switch (validationType) {
        case 'address-generate':
          validationResult = validateAddressGenerateRequest(req.body);
          if ('isValid' in validationResult) {
            isValid = validationResult.isValid;
            errors = validationResult.errors;
          }
          break;
        case 'address-validate':
          validationResult = validateAddressValidateRequest(req.body);
          if ('isValid' in validationResult) {
            isValid = validationResult.isValid;
            errors = validationResult.errors;
          }
          break;
        case 'balance':
          // 对于余额查询，从params中获取参数并构建请求对象
          const { coinKey, address } = req.params;
          const balanceRequest = {
            address: address ? decodeURIComponent(address) : '',
            coinKey: coinKey ? decodeURIComponent(coinKey) : ''
          };
          validationResult = validateBalanceRequest(balanceRequest);
          if ('isAddressValid' in validationResult && 'isCoinKeyValid' in validationResult) {
            isValid = validationResult.isAddressValid && validationResult.isCoinKeyValid;
            errors = validationResult.errors;
          }
          break;
        default:
          logger.warn('Invalid validation type requested', { validationType });
          return res.status(400).json({
            error: 'Invalid validation type',
            message: 'Unsupported validation type specified'
          });
      }

      // 如果有验证错误，返回400错误
      if (!isValid || errors.length > 0) {
        logger.warn('Request validation failed', {
          validationType,
          errors,
          path: req.path
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid request parameters',
          details: errors
        });
      }

      // 验证通过，继续处理请求
      next();
    } catch (error) {
      // 处理验证过程中的异常
      logger.error('Validation middleware error:', { error, path: req.path });
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to validate request'
      });
    }
  };
};

/**
 * 创建特定的验证中间件函数，方便路由使用
 */
export const validateAddressGenerate = validationMiddleware('address-generate');
export const validateAddressValidate = validationMiddleware('address-validate');
export const validateBalance = validationMiddleware('balance');