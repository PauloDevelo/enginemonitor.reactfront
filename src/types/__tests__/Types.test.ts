import chai from 'chai';
import { createDefaultAsset } from '../../helpers/AssetHelper';
import { extractAssetModel } from '../Types';

describe('Types', () => {
  describe('extractAssetModel', () => {
    it('it should extract all the field with a record at true', () => {
      // Arrange
      const assetToExtract = createDefaultAsset();
      assetToExtract.brand = 'Aluminium & Techniques';
      assetToExtract.manufactureDate = new Date();
      assetToExtract.modelBrand = 'Heliotrope';
      assetToExtract.name = 'Arbutus';

      // Act
      const assetExtracted = extractAssetModel(assetToExtract);

      // Assert
      chai.expect(assetExtracted).to.have.property('brand', 'Aluminium & Techniques', 'because the property brand should be extracted.');
      chai.expect(assetExtracted).to.have.property('manufactureDate', assetToExtract.manufactureDate, 'because the property manufactureDate should be extracted.');
      chai.expect(assetExtracted).to.have.property('modelBrand', 'Heliotrope', 'because the property modelBrand should be extracted.');
      chai.expect(assetExtracted).to.have.property('name', 'Arbutus', 'because the property name should be extracted.');
    });
  });
});
