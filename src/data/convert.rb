# encoding: UTF-8
# coding: UTF-8
# -*- coding: UTF-8 -*-

require 'json'
require 'fileutils'

DESTDIR = '../../www/data'

booksdata = {
    "mateus" => {:name => "Evangelho de Jesus segundo Mateus", :shortName => "Mateus"},
    "marcos" => {:name => "Evangelho de Jesus segundo Marcos", :shortName => "Marcos"},
    "lucas" => {:name => "Evangelho de Jesus segundo Lucas", :shortName => "Lucas"},
    "joao" => {:name => "Evangelho de Jesus segundo João", :shortName => "João"},
    "atos" => {:name => "Atos dos apóstolos", :shortName => "Atos"},
    "romanos" => {:name => "Epístola aos Romanos", :shortName => "Romanos"},
    "1-corintios" => {:name => "Primeira Epístola aos Coríntios", :shortName => "1 Coríntios"},
    "2-corintios" => {:name => "Segunda Epístola aos Coríntios", :shortName => "2 Coríntios"},
    "galatas" => {:name => "Epístola aos Gálatas", :shortName => "Gálatas"},
    "efesios" => {:name => "Epístola aos Efésios", :shortName => "Efésios"},
    "filipenses" => {:name => "Epístola aos Filipenses", :shortName => "Filipenses"},
    "colossenses" => {:name => "Epístola aos Colossenses", :shortName => "Colossenses"},
    "1-tessalonicenses" => {:name => "Primeira Epístola aos Tessalonicenses", :shortName => "1 Tessalonicenses"},
    "2-tessalonicenses" => {:name => "Segunda Epístola aos Tessalonicenses", :shortName => "2 Tessalonicenses"},
    "1-timoteo" => {:name => "Primeira Epístola a Timóteo", :shortName => "1 Timóteo"},
    "2-timoteo" => {:name => "Segunda Epístola a Timóteo", :shortName => "2 Timóteo"},
    "tito" => {:name => "Epístola a Tito", :shortName => "Tito"},
    "filemom" => {:name => "Epístola a Filémom", :shortName => "Filémom"},
    "hebreus" => {:name => "Epístola aos Hebreus", :shortName => "Hebreus"},
    "tiago" => {:name => "Epístola de Tiago", :shortName => "Tiago"},
    "1-pedro" => {:name => "Primeira Epístola de Pedro", :shortName => "1 Pedro"},
    "2-pedro" => {:name => "Segunda Epístola de Pedro", :shortName => "2 Pedro"},
    "1-joao" => {:name => "Primeira Epístola de João", :shortName => "1 João"},
    #"2-joao" => {:name => "Segunda Epístola de João", :shortName => "2 João"},
    #"3-joao" => {:name => "Terceira Epístola de João", :shortName => "3 João"},
    "judas" => {:name => "Epístola de Judas", :shortName => "Judas"},
    "apocalipse" => {:name => "Apocalipse de Jesus", :shortName => "Apocalipse"}
}

books = []

booksdata.each do |bookdir, bookdata|
    next if File.directory? bookdir

    FileUtils::mkdir_p("#{DESTDIR}/#{bookdir}")

    chapter_amount = 0

    Dir.entries("livros/#{bookdir}").each do |chapterdir|
        next if File.directory? chapterdir

        chapter_number = chapterdir.split('-')[1].to_i

        verses = []

        Dir.entries("livros/#{bookdir}/#{chapterdir}").each do |versefile|
            next if File.directory? versefile

            verse_number = versefile.split('.')[0].split('-')[1].to_i

            text = ''            
            File.open("livros/#{bookdir}/#{chapterdir}/#{versefile}", "r:UTF-8") do |file|
                text = file.read
            end
            
            verses << {:number => verse_number, :text => text}
        end

        verses.sort_by!{ |v| v[:number] }

        File.open("#{DESTDIR}/#{bookdir}/#{chapter_number}.json", 'w:UTF-8') do |file|
            file.puts( {:verses => verses}.to_json )
        end

        chapter_amount += 1
    end

    books << {:id => bookdir, :name => bookdata[:name], :shortName => bookdata[:shortName], :chapterAmount => chapter_amount}
end

File.open("#{DESTDIR}/books.json", 'w:UTF-8') do |file|
    file.puts( {:books => books}.to_json )
end