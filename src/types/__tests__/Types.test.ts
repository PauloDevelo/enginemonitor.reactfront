import chai from 'chai';
import { createDefaultAsset } from '../../helpers/AssetHelper';
import { AssetModel, extract } from '../Types';

describe('Types', () => {
  describe('extract', () => {
    it('it should extract all the field with a record at true', () => {
      // Arrange
      const assetToExtract = createDefaultAsset();
      assetToExtract.brand = 'Aluminium & Techniques';
      assetToExtract.manufactureDate = new Date();
      assetToExtract.modelBrand = 'Heliotrope';
      assetToExtract.name = 'Arbutus';

      // Act
      const assetExtracted = extract<AssetModel>({
        _uiId: true,
        name: true,
        brand: false,
        manufactureDate: true,
        modelBrand: false,
      })(assetToExtract);

      // Assert
      chai.expect(assetExtracted).to.have.property('_uiId', assetToExtract._uiId, 'because the property _uiId should be extracted.');
      chai.expect(assetExtracted).to.not.have.property('brand', 'because the property brand should not be extracted.');
      chai.expect(assetExtracted).to.have.property('manufactureDate', assetToExtract.manufactureDate, 'because the property manufactureDate should be extracted.');
      chai.expect(assetExtracted).to.not.have.property('modelBrand', 'because the property modelBrand should be extracted.');
      chai.expect(assetExtracted).to.have.property('name', 'Arbutus', 'because the property name should be extracted.');
    });
  });
});
