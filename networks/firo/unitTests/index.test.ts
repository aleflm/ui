import { describe, it, expect } from 'vitest';
import * as FiroModule from '../src/index';

describe('Firo Module Exports', () => {
  it('should export FiroNetwork class', () => {
    expect(FiroModule.FiroNetwork).toBeDefined();
    expect(typeof FiroModule.FiroNetwork).toBe('function');
  });

  it('should export utility functions', () => {
    expect(FiroModule.generateOpReturnData).toBeDefined();
    expect(FiroModule.getAddressBalance).toBeDefined();
    expect(FiroModule.submitTransaction).toBeDefined();
    expect(FiroModule.getAddressUtxos).toBeDefined();
    expect(FiroModule.calculateFee).toBeDefined();
    expect(FiroModule.isValidFiroAddress).toBeDefined();
    expect(FiroModule.selectUtxos).toBeDefined();
    expect(FiroModule.satoshisToFiro).toBeDefined();
    expect(FiroModule.firoToSatoshis).toBeDefined();
    expect(FiroModule.formatFiroAmount).toBeDefined();
  });

  it('should export generateUnsignedTx function', () => {
    expect(FiroModule.generateUnsignedTx).toBeDefined();
    expect(typeof FiroModule.generateUnsignedTx).toBe('function');
  });

  it('should export getMaxTransfer function', () => {
    expect(FiroModule.getMaxTransfer).toBeDefined();
    expect(typeof FiroModule.getMaxTransfer).toBe('function');
  });

  it('should export types', () => {
    // Type exports can't be tested at runtime, but we can verify the module structure
    expect(FiroModule).toHaveProperty('FiroNetwork');
    expect(FiroModule).toHaveProperty('generateUnsignedTx');
    expect(FiroModule).toHaveProperty('getMaxTransfer');
  });

  it('should have all required constants', () => {
    expect(FiroModule.FIRO_DECIMALS).toBeDefined();
    expect(FiroModule.FIRO_DECIMALS).toBe(8);
    expect(FiroModule.FIRO_MIN_DUST).toBeDefined();
    expect(FiroModule.FIRO_MIN_DUST).toBe(BigInt(1000));
  });

  it('should ensure all exports are functions or constants', () => {
    const exports = Object.keys(FiroModule);
    
    exports.forEach(exportName => {
      const exportValue = (FiroModule as any)[exportName];
      const type = typeof exportValue;
      
      expect(['function', 'number', 'bigint', 'string', 'object'].includes(type))
        .toBe(true, `Export ${exportName} has unexpected type: ${type}`);
    });
  });
});