#!/usr/bin/perl

#
# Dumps all internal Ponomar data structures as JSON (or YAML) files for a series of days
# this is useful for regression testing.
#

use strict;
use warnings;
use utf8;

use Ponomar;
use Ponomar::JDate;
use Ponomar::Util;
use YAML::Tiny qw(DumpFile);
use JSON::PP;

sub objPonomar {
    my $ponomar = shift;
    my @saints = map (objSaint($_), $ponomar->getSaints());

    my $out = {
        "fastings" => $ponomar->getFastingCode(),
        "tone" => $ponomar->getToneCode(),
    };

    $out->{"saints"} = \@saints;

    $out = decode_json(encode_json($out));  # deep clone, just in case

    return $out;
}

sub objSaint {
    my $saint = shift;
    my $out = {
        "cid"  => $saint->getKey('CId'),
        "name" => ($saint->getKey('Name')),
        "type" => $saint->getKey('Type'),
        "src"  => $saint->getKey('Src'),
        "menologion" => $saint->getKey('Menologion'),
        "info" => ($saint->getKey('Info')),
        "life" => $saint->getKey('Life'),
        "ref"  => $saint->getKey('Ref'),
    };

    if ($saint->hasServices()) {
        my @services = map (objService($_), $saint->getServices());
        $out->{services} = \@services;
    }

    return $out;
}

sub objService {
    my $service = shift;

    my $out = {
        "type" => $service->getType(),
    };

    if ($service->hasReadings()) {
        my @readings = map(objReading($_), $service->getReadings());
        $out->{readings} = \@readings;
    }

    return $out;
}

sub objReading {
    my $reading = shift;
    my $out = {
        "type" => $reading->getType(),
        "reading" => $reading->getReading(),
        "pericope" => $reading->getPericope(),
        "effWeek" => $reading->getEffWeek(),
    };

    return $out;
}

my @all_langs = ("cu/ru", "cu", "el", "en", "fr", "zh/Hans", "zh/Hant");

sub DumpPonomar {
    my ($date, $filename) = @_;
    my $year = $date->getYear();
    my $month = $date->getMonth();
    my $day = $date->getDay();
    my $obj = {
        "date" => $year . "/" . $month . "/" . $day,
        "langs" => {},
    };

    for my $lang (@all_langs) {
        $obj->{langs}->{$lang} = {
            "ponomar" => undef,
            "ponomarReordered" => undef,
        };

        my $ponomar;
        eval {
            $ponomar = new Ponomar($date, $lang);
        };
        if ($@) {
            $obj->{langs}->{$lang}->{error} = "" . $@;
            next;
        }

        my $p = objPonomar($ponomar);
        $obj->{langs}->{$lang}->{ponomar} = $p;

        # now, run execCommand algo to reorder readings
        foreach ($ponomar->getSaints('pentecostarion')) {
            next unless ($_->getKey('CId') >= 9000 && $_->getKey('CId') <= 9315) || ($_->getKey('CId') >= 9849 && $_->getKey('CId') < 9900);
            my @services = $_->getServices();
            foreach my $service (@services) {
                ## EXECCOMMANDS TAKES DRANK ARGUMENT
                ## USER MUST SET DRANK BASED ON WHAT SERVICE HE'S DOING
                ## FOR NOW, WE'RE USING THE MAX AVAILABLE DRANK
                $service->execCommands( max (  map { $_->getKey("Type") } $ponomar->getSaints() ) );
            }
        }

        $p = objPonomar($ponomar);
        $obj->{langs}->{$lang}->{ponomarReordered} = $p;
    }

    my $FH;
    open($FH, '>', $filename . ".json");
    binmode($FH, "encoding(UTF-8)");
    print $FH JSON::PP->new->pretty->encode($obj);
    close($FH);

    $obj = decode_json(encode_json($obj));  # this gets rid of circular refs that yaml does not like

    DumpFile($filename . ".yml", $obj);
}

sub dec2 {
    my $val = shift;
    if ($val < 10) {
        return "0" . $val;
    } else {
        return "" . $val;
    }
}

if ($#ARGV + 1 != 3) {
    print "\nUsage: Dump.pm startDate endDate targetDir\n\twhere date must be in MM/DD/YYYY format\n";
    exit;
}

my ($smonth, $sday, $syear) = split('/', $ARGV[0]);
my ($emonth, $eday, $eyear) = split('/', $ARGV[1]);
my $targetDir = $ARGV[2];

if ( !-d $targetDir ) {
    mkdir $targetDir or die "Can not create directory $targetDir";
}

my $date = new Ponomar::JDate($smonth, $sday, $syear);
my $endDate = new Ponomar::JDate($emonth, $eday, $eyear);

while ($date < $endDate) {
    my $y = $date->getYear();
    my $m = dec2($date->getMonth());
    my $d = dec2($date->getDay());
    my $fname = "$targetDir/" . $y . $m . $d;
    print "$fname\n";
    DumpPonomar($date, $fname);
    $date = $date->addDays(1);
}
