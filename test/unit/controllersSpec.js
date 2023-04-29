'use strict';

describe('Filters', function() {

	beforeEach(module('MinIONAppFilters'));

	describe('Big number filter',function() {

		it('should return human readable number format ',
			inject(function(bigNumberFilter) {

				expect(bigNumberFilter(1)).toEqual(1);
				expect(bigNumberFilter(10)).toEqual(10);
				expect(bigNumberFilter(100)).toEqual(100);
				expect(bigNumberFilter(1000)).toEqual('1.00 K');
				expect(bigNumberFilter(10000)).toEqual('10.00 K');
				expect(bigNumberFilter(100000)).toEqual('0.10 M');
				expect(bigNumberFilter(1000000)).toEqual('1.00 M');
				expect(bigNumberFilter(2300000)).toEqual('2.30 M');
				expect(bigNumberFilter(8300000)).toEqual('8.30 M');
				expect(bigNumberFilter(10000000)).toEqual('10.00 M');
				expect(bigNumberFilter(100000000)).toEqual('0.01 G');
				expect(bigNumberFilter(1000000000)).toEqual('0.10 G');
				expect(bigNumberFilter(10000000000)).toEqual('1.00 G');

			})
		)

	})

	describe('Transcriber filter', function() {

		it('should transform DNA triplets into numbers', inject(function(transcriberFilter) {

			expect(transcriberFilter("AAA")).toEqual(" 0 ")
			expect(transcriberFilter("AAG")).toEqual(" 1 ")
			expect(transcriberFilter("AAT")).toEqual(" 2 ")
			expect(transcriberFilter("AAC")).toEqual(" 3 ")
			expect(transcriberFilter("GGG")).toEqual(" 21 ")
			expect(transcriberFilter("CCC")).toEqual(" 63 ")

			expect(transcriberFilter("CCC AAG")).toEqual(" 63 1 ")
			expect(transcriberFilter("CCC AAG GGG")).toEqual(" 63 1 21 ")
		}))

	})


})

describe('MinIONApp services', function() {

	var SequenceMatcher

	describe('Sequence matcher', function() {

		beforeEach(module('sequenceMatcherService'))
		beforeEach(inject(function(_SequenceMatcher_){
			SequenceMatcher = _SequenceMatcher_

		}))

		it('should count occurences of a pattern in a string', function() {
			var needle = "21"
			var haystack = " 0 23 54 60 21 45 21 "

			expect(SequenceMatcher.count(needle,haystack)).toEqual(2)

			haystack = " 20 10 2 1 11 13 "

			expect(SequenceMatcher.count(needle,haystack)).toEqual(0)

			haystack = " 21 "

			expect(SequenceMatcher.count(needle,haystack)).toEqual(1)

			haystack = ""
			expect(SequenceMatcher.count(needle,haystack)).toEqual(0)

			needle = "18 32"
			haystack = " 7 18 32 15 10 "
			expect(SequenceMatcher.count(needle,haystack)).toEqual(1)

		})


	})

	describe('Sequence editor', function() {

		var SequenceEditor
		var editId = -1
		var editSeq = {}
		var sequences = [{'structure': 'AAA', 'name': 'Strand 1'}]

		beforeEach(module('sequenceDialogService'))
		beforeEach(inject(function(_SequenceEditor_) {
			SequenceEditor = _SequenceEditor_
		}))

		it('should not accept empty values', function() {

			editSeq = {'structure': '', 'name': ''}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'AAA', 'name': ''}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'AAA', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(true)

		})

		it('should validate strands', function() {

			//Only capital letters A, G, C or T
			editSeq = {'structure': 'XXX', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'acg', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			//Only triplets

			editSeq = {'structure': 'AAA A', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'AA', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'AAG CT', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			editSeq = {'structure': 'AAC AAAT', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)

			//This is fine

			editSeq = {'structure': 'AAC AAA', 'name': 'Strand 2'}
			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(true)


		})

		it('should increment the counter only if adding a valid strand',function() {

			editId = 0 //Editing a strand

			expect(SequenceEditor.counter).toEqual(-1)

			editSeq = {'structure': 'AAA', 'name': 'Strand 2'}

			expect(sequences[editId]).not.toEqual(editSeq)

			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(true)

			expect(SequenceEditor.counter).toEqual(-1)

			expect(sequences[editId]).toEqual(editSeq)



			sequences = [{'structure': 'AAA', 'name': 'Strand 1'}]

			editId = -1 //Adding a strand

			expect(SequenceEditor.counter).toEqual(-1)

			editSeq = {'structure': '', 'name': 'Strand 2'}

			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(false)
			expect(SequenceEditor.counter).toEqual(-1)

			editSeq = {'structure': 'AAA', 'name': 'Strand 2'}

			expect(SequenceEditor.editSequence(editId,editSeq,sequences)).toEqual(true)

			expect(SequenceEditor.counter).toEqual(2)

		})

	})

})


describe('MinIONApp controllers', function() {
	var 	scope,
		controller,
		element,
		svg,
		$httpBackend,
		$interval



	var strands =
[
	{
		"name": "Keratin",
		"structure": "AAA",
		"prob": 0,
		"rate": 0
	},
	{
		"name": "Something",
		"structure": "GGG",
		"prob": 0,
		"rate": 0
	},
	{
		"name": "Collagen",
		"structure": "TTT",
		"prob": 0,
		"rate": 0
	},
	{
		"name": "Elastin",
		"structure": "CCC",
		"prob": 0,
		"rate": 0
	}
]


	beforeEach(module('MinIONApp'));
	beforeEach(module('dataSupplierService'));
	//beforeEach(module('sequenceMatcherService'));
	beforeEach(module('colors'));
	beforeEach(module('sequenceDialogService'));
	beforeEach(module('backendService'));
	beforeEach(module('dataCollectionService'));
	beforeEach(module('ngResource'));

	beforeEach(inject(function($controller, $rootScope, ngDialog, $http, DataChunk, _$interval_, transcriberFilter, SequenceMatcher, $window, $filter, Color, SequenceEditor, BackendConnection, DataCollection, $compile, _$httpBackend_) {

			$interval = _$interval_
			$httpBackend = _$httpBackend_
			scope = $rootScope.$new()
			controller = $controller('SequenceListCtrl', { $scope: scope })
			element = $compile('<minion-rectangle />')($rootScope);
			svg = $compile('<div class="paddingHack"><svg class="rect" viewBox="0 0 100 100" style="fill:{{sequence.color}}"><rect x="0" y="0" width="200" height="200" /></svg></div>')($rootScope)

      			$httpBackend.expectGET('strands/strands.json').respond(strands)

			$rootScope.$digest()
	}))

	//TESTS

	describe('Directive test', function() {

		it ('shows svg rectangles', function() {

			expect(element.attr('class').indexOf('paddingHack')).not.toEqual(-1)
			expect(element.find('rect').attr('x')).toBe('0')
			expect(element.html()).toEqual(svg.html())
		})
	})

	describe('Controler', function() {

		it('should create "sequence" model with 4 sequences from xhr', function() {

			$httpBackend.flush();

			expect(scope.sequences.length).toBe(4)


		})

	})

	describe('Integrity tests', function() {

		it('should update values of the global counter and values for each strand after ivoking data collection', function() {
			$httpBackend.flush();

			expect(scope.global.counter).toEqual(0)
			expect(scope.sequences[0].rate).toEqual(0)

			scope.startDataCollection()

			$interval.flush(scope.rate+1)

			expect(scope.global.counter).toEqual(scope.bufferSize)
			expect(scope.sequences[0].rate).toBeGreaterThan(0)

			$interval.flush(scope.rate)

			scope.stopDataCollection()

			expect(scope.global.counter).toEqual(scope.bufferSize*2)

		})

	})
})
